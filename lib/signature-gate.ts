import crypto from 'crypto';

const GATE_COOKIE = 'plrei_sig_gate';
const DEFAULT_TTL_SECONDS = 60 * 60 * 24;

function getGateSecret(): string {
  return process.env.SIGNATURE_SECRET_KEY ?? '';
}

export function getGateCookieName(): string {
  return GATE_COOKIE;
}

export function createGateCookieValue(now = Date.now()): string {
  const secret = getGateSecret();
  if (!secret) {
    throw new Error('SIGNATURE_SECRET_KEY is not configured.');
  }
  const exp = now + DEFAULT_TTL_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ exp }), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
  return `${payload}.${sig}`;
}

export function verifyGateCookieValue(value: string | undefined, now = Date.now()): boolean {
  if (!value) {
    return false;
  }
  const secret = getGateSecret();
  if (!secret) {
    return false;
  }

  const [payload, sig] = value.split('.');
  if (!payload || !sig) {
    return false;
  }

  const expectedSig = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
  const sigBuf = Buffer.from(sig, 'hex');
  const expectedBuf = Buffer.from(expectedSig, 'hex');

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number };
    return typeof parsed.exp === 'number' && now < parsed.exp;
  } catch {
    return false;
  }
}
