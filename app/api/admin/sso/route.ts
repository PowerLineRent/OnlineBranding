import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { encryptSsoSecret, hasSsoEncryptionKey } from '@/lib/auth/sso-secrets';

// providerKey: lowercase alphanumeric + hyphens, 1–60 chars, must start with a letter
const PROVIDER_KEY_RE = /^[a-z][a-z0-9-]{0,59}$/;

const createProviderSchema = z.object({
  providerKey: z.string().regex(PROVIDER_KEY_RE, 'providerKey must be lowercase letters, digits, and hyphens (start with a letter, max 60 chars)'),
  type: z.enum(['google', 'microsoft']),
  displayName: z.string().trim().min(1).max(100),
  clientId: z.string().trim().min(1).max(300),
  clientSecret: z.string().trim().min(1).max(500),
  tenantId: z.string().trim().max(200).optional(),
  redirectUri: z.string().trim().url().max(500).optional(),
  scope: z.string().trim().min(1).max(500).default('openid profile email'),
  isActive: z.boolean().default(false),
});

function unauthorized() {
  return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
}

export async function GET() {
  const session = await auth();
  if (!isAdminSession(session)) return unauthorized();

  const rows = await prisma.ssoProviderConfig.findMany({
    select: {
      providerKey: true,
      type: true,
      displayName: true,
      clientId: true,
      clientSecretEncrypted: true,
      tenantId: true,
      redirectUri: true,
      callbackUrl: true,
      scope: true,
      isActive: true,
    },
    orderBy: [{ type: 'asc' }, { providerKey: 'asc' }],
  });

  type ProviderRow = (typeof rows)[number];
  return NextResponse.json({
    providers: rows.map((row: ProviderRow) => ({
      providerKey: row.providerKey,
      type: row.type,
      displayName: row.displayName,
      clientId: row.clientId,
      tenantId: row.tenantId ?? '',
      redirectUri: row.redirectUri ?? row.callbackUrl ?? '',
      scope: row.scope,
      isActive: row.isActive,
      hasClientSecret: Boolean(row.clientSecretEncrypted),
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!isAdminSession(session)) return unauthorized();

  if (!hasSsoEncryptionKey()) {
    return NextResponse.json(
      { error: 'SSO_ENCRYPTION_KEY or AUTH_SECRET must be configured before storing SSO secrets.' },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = createProviderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join('; ') },
      { status: 400 }
    );
  }

  const { providerKey, type, displayName, clientId, clientSecret, tenantId, redirectUri, scope, isActive } = parsed.data;

  if (type === 'microsoft' && !tenantId) {
    return NextResponse.json({ error: 'tenantId is required for Microsoft providers.' }, { status: 400 });
  }
  if (type === 'microsoft' && !redirectUri) {
    return NextResponse.json({ error: 'redirectUri is required for Microsoft providers.' }, { status: 400 });
  }
  if (type === 'google' && !redirectUri) {
    return NextResponse.json({ error: 'redirectUri (callback URL) is required for Google providers.' }, { status: 400 });
  }

  const existing = await prisma.ssoProviderConfig.findUnique({ where: { providerKey } });
  if (existing) {
    return NextResponse.json({ error: `Provider key "${providerKey}" already exists.` }, { status: 409 });
  }

  const encryptedSecret = encryptSsoSecret(clientSecret);
  if (!encryptedSecret) {
    return NextResponse.json({ error: 'Failed to encrypt client secret.' }, { status: 500 });
  }

  await prisma.ssoProviderConfig.create({
    data: {
      providerKey,
      type,
      displayName,
      clientId,
      clientSecretEncrypted: encryptedSecret,
      tenantId: tenantId ?? null,
      callbackUrl: redirectUri ?? null,
      redirectUri: redirectUri ?? null,
      issuer: type === 'google' ? 'https://accounts.google.com' : null,
      scope,
      isActive,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
