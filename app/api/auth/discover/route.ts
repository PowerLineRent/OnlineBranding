import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { discoverAuthMode } from '@/lib/auth/discover';
import { checkRateLimit } from '@/lib/rate-limit';
import { normalizeEmail } from '@/lib/security';
import { getActiveProviderIds } from '@/lib/auth/providers';

const bodySchema = z.object({
  email: z.string().email().max(320),
});

function isOriginAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) {
    return true;
  }
  const host = req.headers.get('host');
  if (!host) {
    return false;
  }

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
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const rateLimitKey = `discover:${ip}:${email}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, 10, 60_000);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfterSec) } }
    );
  }

  try {
    const result = await discoverAuthMode(email);
    if (result.mode === 'sso') {
      const validProviders = await getActiveProviderIds();
      if (!validProviders.has(result.providerId)) {
        return NextResponse.json({ mode: 'password' });
      }
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Unable to process sign-in request.' }, { status: 500 });
  }
}
