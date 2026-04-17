import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      lastLoginAt: true,
      isActive: true,
    },
    orderBy: [{ role: 'asc' }, { email: 'asc' }],
  });

  type UserRow = (typeof users)[number];
  return NextResponse.json({
    users: users.map((user: UserRow) => ({
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      role: user.role,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      status: user.isActive ? 'active' : 'inactive',
    })),
  });
}
