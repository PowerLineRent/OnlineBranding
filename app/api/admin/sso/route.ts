import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { encryptSsoSecret, hasSsoEncryptionKey } from '@/lib/auth/sso-secrets';

const providerSchema = z.object({
  clientId: z.string().trim().min(1).max(300),
  clientSecret: z.string().trim().max(500).optional(),
  scope: z.string().trim().min(1).max(500).default('openid profile email'),
  isActive: z.boolean().default(false),
});

const googleSchema = providerSchema.extend({
  callbackUrl: z.string().trim().url().max(500),
});

const microsoftSchema = providerSchema.extend({
  tenantId: z.string().trim().min(1).max(200),
  redirectUri: z.string().trim().url().max(500),
});

const bodySchema = z.object({
  google: googleSchema,
  microsoft: microsoftSchema,
});

type SsoResponse = {
  google: {
    clientId: string;
    callbackUrl: string;
    scope: string;
    isActive: boolean;
    hasClientSecret: boolean;
  };
  microsoft: {
    tenantId: string;
    clientId: string;
    redirectUri: string;
    scope: string;
    isActive: boolean;
    hasClientSecret: boolean;
  };
};

function unauthorized() {
  return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
}

export async function GET() {
  const session = await auth();
  if (!isAdminSession(session)) {
    return unauthorized();
  }

  const providers = await prisma.ssoProviderConfig.findMany({
    where: { providerKey: { in: ['google', 'microsoft'] } },
    select: {
      providerKey: true,
      clientId: true,
      clientSecretEncrypted: true,
      callbackUrl: true,
      redirectUri: true,
      scope: true,
      tenantId: true,
      isActive: true,
    },
  });

  const google = providers.find((provider) => provider.providerKey === 'google');
  const microsoft = providers.find((provider) => provider.providerKey === 'microsoft');

  const response: SsoResponse = {
    google: {
      clientId: google?.clientId ?? '',
      callbackUrl: google?.callbackUrl ?? '',
      scope: google?.scope ?? 'openid profile email',
      isActive: google?.isActive ?? false,
      hasClientSecret: Boolean(google?.clientSecretEncrypted),
    },
    microsoft: {
      tenantId: microsoft?.tenantId ?? '',
      clientId: microsoft?.clientId ?? '',
      redirectUri: microsoft?.redirectUri ?? '',
      scope: microsoft?.scope ?? 'openid profile email',
      isActive: microsoft?.isActive ?? false,
      hasClientSecret: Boolean(microsoft?.clientSecretEncrypted),
    },
  };

  return NextResponse.json(response);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!isAdminSession(session)) {
    return unauthorized();
  }
  if (!hasSsoEncryptionKey()) {
    return NextResponse.json(
      { error: 'SSO_ENCRYPTION_KEY or AUTH_SECRET must be configured to store SSO secrets.' },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid SSO configuration payload.' }, { status: 400 });
  }

  const existing = await prisma.ssoProviderConfig.findMany({
    where: { providerKey: { in: ['google', 'microsoft'] } },
    select: { providerKey: true, clientSecretEncrypted: true },
  });
  const existingMap = new Map(existing.map((row) => [row.providerKey, row.clientSecretEncrypted]));

  const googleSecret = parsed.data.google.clientSecret
    ? encryptSsoSecret(parsed.data.google.clientSecret)
    : existingMap.get('google') ?? null;
  const microsoftSecret = parsed.data.microsoft.clientSecret
    ? encryptSsoSecret(parsed.data.microsoft.clientSecret)
    : existingMap.get('microsoft') ?? null;

  if (!googleSecret || !microsoftSecret) {
    return NextResponse.json(
      { error: 'Client secret is required for both Google and Microsoft before saving.' },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.ssoProviderConfig.upsert({
      where: { providerKey: 'google' },
      update: {
        type: 'google',
        displayName: 'Google',
        clientId: parsed.data.google.clientId,
        clientSecretEncrypted: googleSecret,
        callbackUrl: parsed.data.google.callbackUrl,
        redirectUri: parsed.data.google.callbackUrl,
        issuer: 'https://accounts.google.com',
        tenantId: null,
        scope: parsed.data.google.scope,
        isActive: parsed.data.google.isActive,
      },
      create: {
        providerKey: 'google',
        type: 'google',
        displayName: 'Google',
        clientId: parsed.data.google.clientId,
        clientSecretEncrypted: googleSecret,
        callbackUrl: parsed.data.google.callbackUrl,
        redirectUri: parsed.data.google.callbackUrl,
        issuer: 'https://accounts.google.com',
        tenantId: null,
        scope: parsed.data.google.scope,
        isActive: parsed.data.google.isActive,
      },
    }),
    prisma.ssoProviderConfig.upsert({
      where: { providerKey: 'microsoft' },
      update: {
        type: 'microsoft',
        displayName: 'Microsoft Entra ID',
        tenantId: parsed.data.microsoft.tenantId,
        clientId: parsed.data.microsoft.clientId,
        clientSecretEncrypted: microsoftSecret,
        callbackUrl: parsed.data.microsoft.redirectUri,
        redirectUri: parsed.data.microsoft.redirectUri,
        issuer: null,
        scope: parsed.data.microsoft.scope,
        isActive: parsed.data.microsoft.isActive,
      },
      create: {
        providerKey: 'microsoft',
        type: 'microsoft',
        displayName: 'Microsoft Entra ID',
        tenantId: parsed.data.microsoft.tenantId,
        clientId: parsed.data.microsoft.clientId,
        clientSecretEncrypted: microsoftSecret,
        callbackUrl: parsed.data.microsoft.redirectUri,
        redirectUri: parsed.data.microsoft.redirectUri,
        issuer: null,
        scope: parsed.data.microsoft.scope,
        isActive: parsed.data.microsoft.isActive,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
