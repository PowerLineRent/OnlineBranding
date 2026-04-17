import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

const updateUserSchema = z.object({
  role: z.enum(['user', 'admin']),
});

function unauthorized() {
  return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!isAdminSession(session)) return unauthorized();

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join('; ') },
      { status: 400 }
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true },
  });
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (session?.user?.id === targetUser.id && parsed.data.role !== 'admin') {
    return NextResponse.json({ error: 'You cannot remove your own admin access.' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
  });

  return NextResponse.json({ ok: true });
}

