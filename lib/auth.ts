import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSsoProviders, toAuthJsOauthProvider } from '@/lib/auth/providers';
import { normalizeEmail } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';
import { DEFAULT_ADMIN_EMAIL } from '@/lib/auth/admin';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

async function ensureAdminBootstrapUser(email: string): Promise<void> {
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL);
  if (email !== adminEmail) return;

  const adminPasswordHash = (process.env.ADMIN_PASSWORD_HASH ?? '').trim();
  if (!adminPasswordHash) {
    authWarn('admin_bootstrap_hash_missing');
    return;
  }

  try {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        passwordHash: adminPasswordHash,
        role: 'admin',
        isActive: true,
      },
      create: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: 'admin',
        isActive: true,
      },
    });
  } catch (error) {
    authError('admin_bootstrap_failed', error, { email: redactEmail(adminEmail) });
  }
}

function redactEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '[invalid-email]';
  if (local.length <= 2) return `**@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

function authWarn(code: string, context: Record<string, unknown> = {}) {
  console.warn(`[auth][credentials] ${code}`, context);
}

function authError(code: string, error: unknown, context: Record<string, unknown> = {}) {
  console.error(`[auth][credentials] ${code}`, {
    ...context,
    message: error instanceof Error ? error.message : String(error),
  });
}

function credentialsProvider() {
  return Credentials({
    name: 'Password',
    credentials: {
      email: { label: 'Email', type: 'text' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(rawCredentials, request) {
      // Keep secure null returns while adding explicit diagnostics.
      try {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          authWarn('invalid_credentials_payload', {
            issues: parsed.error.issues.map((issue) => issue.code),
          });
          return null;
        }

        const email = normalizeEmail(parsed.data.email);
        await ensureAdminBootstrapUser(email);
        const ip = request?.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
        const limit = checkRateLimit(`credentials:${ip}:${email}`, 10, 60_000);
        if (!limit.allowed) {
          authWarn('rate_limited', {
            ip,
            email: redactEmail(email),
            retryAfterSec: limit.retryAfterSec,
          });
          return null;
        }

        let user: Awaited<ReturnType<typeof prisma.user.findUnique>>;
        try {
          user = await prisma.user.findUnique({ where: { email } });
        } catch (error) {
          authError('db_lookup_failed', error, { email: redactEmail(email) });
          return null;
        }

        if (!user) {
          authWarn('user_not_found', { email: redactEmail(email) });
          return null;
        }
        if (!user.passwordHash) {
          authWarn('password_hash_missing', { email: redactEmail(email), userId: user.id });
          return null;
        }
        if (!user.isActive) {
          authWarn('user_inactive', { email: redactEmail(email), userId: user.id });
          return null;
        }

        const isValidPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!isValidPassword) {
          authWarn('password_mismatch', { email: redactEmail(email), userId: user.id });
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.email,
          role: user.role,
        };
      } catch (error) {
        authError('authorize_unexpected_error', error);
        return null;
      }
    },
  });
}

function buildBaseConfig(): Omit<NextAuthConfig, 'providers'> {
  return {
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' },
    trustHost: true,
    callbacks: {
      async signIn({ user, account }) {
        const email = normalizeEmail(user.email ?? '');
        const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL);

        if (email === adminEmail && account?.provider !== 'credentials') {
          authWarn('admin_non_credentials_blocked', { provider: account?.provider ?? 'unknown' });
          return false;
        }

        if (!email) {
          authWarn('sign_in_missing_email', { provider: account?.provider ?? 'unknown' });
          return false;
        }

        let dbUser: Awaited<ReturnType<typeof prisma.user.findUnique>>;
        try {
          dbUser = await prisma.user.findUnique({ where: { email } });
        } catch (error) {
          authError('sign_in_db_lookup_failed', error, { email: redactEmail(email) });
          return false;
        }
        if (dbUser && !dbUser.isActive) {
          authWarn('sign_in_inactive_user_blocked', { email: redactEmail(email), userId: dbUser.id });
          return false;
        }
        return true;
      },
      async jwt({ token, user }) {
        const email = normalizeEmail(user?.email ?? token.email ?? '');

        if (user?.id) {
          token.sub = user.id;
        }

        if (user && 'role' in user && typeof user.role === 'string') {
          token.role = user.role;
          return token;
        }

        if (!token.role && email) {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: { role: true },
          });
          if (dbUser?.role) {
            token.role = dbUser.role;
          }
        }

        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          if (token.sub) {
            session.user.id = token.sub;
          }
          session.user.role = typeof token.role === 'string' ? token.role : 'user';
        }
        return session;
      },
    },
    events: {
      async signIn({ user }) {
        const email = normalizeEmail(user.email ?? '');
        if (!email) return;
        await prisma.user.updateMany({
          where: { email },
          data: { lastLoginAt: new Date() },
        });
      },
    },
    cookies: {
      sessionToken: {
        name:
          process.env.NODE_ENV === 'production'
            ? '__Secure-authjs.session-token'
            : 'authjs.session-token',
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        },
      },
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const dynamicProviders = (await getSsoProviders()).map(toAuthJsOauthProvider);
  return {
    ...buildBaseConfig(),
    providers: [credentialsProvider(), ...dynamicProviders],
  };
});
