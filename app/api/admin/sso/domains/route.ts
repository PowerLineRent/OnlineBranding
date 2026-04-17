import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

// Simple domain validation: no protocol, no path, just hostname
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

const createMappingSchema = z.object({
  domain: z.string().toLowerCase().trim().regex(DOMAIN_RE, 'Must be a valid domain (e.g. plrei.com)'),
  providerKey: z.string().trim().min(1).max(60),
  displayName: z.string().trim().max(100).optional(),
  enforceSso: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

function unauthorized() {
  return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
}

export async function GET() {
  const session = await auth();
  if (!isAdminSession(session)) return unauthorized();

  const mappings = await prisma.ssoDomainMapping.findMany({
    orderBy: [{ isActive: 'desc' }, { domain: 'asc' }],
    select: {
      id: true,
      domain: true,
      providerKey: true,
      displayName: true,
      enforceSso: true,
      isActive: true,
    },
  });

  return NextResponse.json({ mappings });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!isAdminSession(session)) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = createMappingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join('; ') },
      { status: 400 }
    );
  }

  const { domain, providerKey, displayName, enforceSso, isActive } = parsed.data;

  // Verify the referenced provider exists
  const provider = await prisma.ssoProviderConfig.findUnique({ where: { providerKey } });
  if (!provider) {
    return NextResponse.json({ error: `Provider "${providerKey}" does not exist.` }, { status: 400 });
  }

  const existing = await prisma.ssoDomainMapping.findUnique({ where: { domain } });
  if (existing) {
    return NextResponse.json({ error: `Domain "${domain}" is already mapped.` }, { status: 409 });
  }

  const mapping = await prisma.ssoDomainMapping.create({
    data: { domain, providerKey, displayName: displayName ?? null, enforceSso, isActive },
  });

  return NextResponse.json({ ok: true, id: mapping.id }, { status: 201 });
}
