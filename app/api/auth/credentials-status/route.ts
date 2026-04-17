import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { normalizeEmail } from '@/lib/security';

const bodySchema = z.object({
  email: z.string().email().max(320),
});

function isOriginAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;

  const host = req.headers.get('host');
  if (!host) return false;

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const rateLimitKey = `credential-status:${ip}:${email}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, 10, 60_000);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfterSec) } }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        isActive: true,
        passwordHash: true,
      },
    });

    const accountExists = Boolean(user?.id && user.isActive && user.passwordHash);
    return NextResponse.json({ accountExists });
  } catch {
    return NextResponse.json({ accountExists: false });
  }
}
