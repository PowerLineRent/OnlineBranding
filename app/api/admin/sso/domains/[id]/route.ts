import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

const updateMappingSchema = z.object({
  providerKey: z.string().trim().min(1).max(60).optional(),
  displayName: z.string().trim().max(100).optional(),
  enforceSso: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

function unauthorized() {
  return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!isAdminSession(session)) return unauthorized();

  const { id } = await context.params;

  const existing = await prisma.ssoDomainMapping.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Domain mapping not found.' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = updateMappingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join('; ') },
      { status: 400 }
    );
  }

  if (parsed.data.providerKey) {
    const provider = await prisma.ssoProviderConfig.findUnique({
      where: { providerKey: parsed.data.providerKey },
    });
    if (!provider) {
      return NextResponse.json(
        { error: `Provider "${parsed.data.providerKey}" does not exist.` },
        { status: 400 }
      );
    }
  }

  await prisma.ssoDomainMapping.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!isAdminSession(session)) return unauthorized();

  const { id } = await context.params;

  const existing = await prisma.ssoDomainMapping.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Domain mapping not found.' }, { status: 404 });
  }

  await prisma.ssoDomainMapping.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
