import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { encryptSsoSecret, hasSsoEncryptionKey } from '@/lib/auth/sso-secrets';

const updateProviderSchema = z.object({
  displayName: z.string().trim().min(1).max(100).optional(),
  clientId: z.string().trim().min(1).max(300).optional(),
  clientSecret: z.string().trim().min(1).max(500).optional(),
  tenantId: z.string().trim().max(200).optional(),
  redirectUri: z.string().trim().url().max(500).optional(),
  scope: z.string().trim().min(1).max(500).optional(),
  isActive: z.boolean().optional(),
});

function unauthorized() {
  return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
}

type RouteContext = { params: Promise<{ key: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!isAdminSession(session)) return unauthorized();

  if (!hasSsoEncryptionKey()) {
    return NextResponse.json(
      { error: 'SSO_ENCRYPTION_KEY or AUTH_SECRET must be configured before storing SSO secrets.' },
      { status: 500 }
    );
  }

  const { key: providerKey } = await context.params;

  const existing = await prisma.ssoProviderConfig.findUnique({
    where: { providerKey },
    select: { providerKey: true, clientSecretEncrypted: true },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Provider not found.' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = updateProviderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join('; ') },
      { status: 400 }
    );
  }

  const { clientSecret, ...rest } = parsed.data;

  let clientSecretEncrypted: string | undefined;
  if (clientSecret) {
    const encrypted = encryptSsoSecret(clientSecret);
    if (!encrypted) {
      return NextResponse.json({ error: 'Failed to encrypt client secret.' }, { status: 500 });
    }
    clientSecretEncrypted = encrypted;
  }

  await prisma.ssoProviderConfig.update({
    where: { providerKey },
    data: {
      ...rest,
      ...(rest.redirectUri ? { callbackUrl: rest.redirectUri } : {}),
      ...(clientSecretEncrypted ? { clientSecretEncrypted } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!isAdminSession(session)) return unauthorized();

  const { key: providerKey } = await context.params;

  const existing = await prisma.ssoProviderConfig.findUnique({ where: { providerKey } });
  if (!existing) {
    return NextResponse.json({ error: 'Provider not found.' }, { status: 404 });
  }

  // Block deletion if any domain mapping still references this provider
  const dependentMappings = await prisma.ssoDomainMapping.count({ where: { providerKey } });
  if (dependentMappings > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${dependentMappings} domain mapping(s) still reference this provider. Remove them first.` },
      { status: 409 }
    );
  }

  await prisma.ssoProviderConfig.delete({ where: { providerKey } });

  return NextResponse.json({ ok: true });
}
