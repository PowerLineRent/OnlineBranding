import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';
import { decodeSignaturePayload } from '@/lib/signature-validation';

const payloadSchema = z.object({
  s: z.string().min(1),
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
  const rateLimitKey = `signature-link:${ip}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, 30, 60_000);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfterSec) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const secretKey = (process.env.SIGNATURE_SECRET_KEY ?? '').trim();
  const configuredBypassHash = (process.env.SIGNATURE_BYPASS_HASH ?? '').trim();
  const bypassHash =
    configuredBypassHash ||
    (secretKey ? crypto.createHash('sha256').update(secretKey, 'utf8').digest('hex') : '');
  if (!bypassHash) {
    return NextResponse.json({ error: 'Server bypass hash is not configured.' }, { status: 500 });
  }

  try {
    const payloadJson = decodeSignaturePayload(parsed.data.s);
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    payload.hash = bypassHash;
    const signedJson = JSON.stringify(payload);
    const signedS = Buffer.from(signedJson, 'utf8').toString('base64url');
    return NextResponse.json({ s: signedS });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to sign signature link.' },
      { status: 400 }
    );
  }
}
