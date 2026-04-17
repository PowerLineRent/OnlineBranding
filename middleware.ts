import { NextRequest, NextResponse } from 'next/server';
import { isDevelopmentAuthBypassEnabled } from '@/lib/auth/dev-bypass';

const PUBLIC_PATHS = ['/login', '/invalid-link'];
const PUBLIC_PREFIXES = ['/api/auth', '/api/signature-link', '/_next', '/static', '/logos', '/letterhead'];
const PUBLIC_FILES = ['/favicon.ico', '/robots.txt', '/sitemap.xml'];
const SESSION_COOKIE_NAMES = [
  '__Secure-authjs.session-token',
  'authjs.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.session-token',
] as const;
const SESSION_COOKIE_PREFIXES = [
  '__Secure-authjs.session-token.',
  'authjs.session-token.',
  '__Secure-next-auth.session-token.',
  'next-auth.session-token.',
] as const;

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeStringCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

async function deriveBypassHash(secretKey: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secretKey));
  return toHex(digest);
}

function shouldSkipAuth(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname) || PUBLIC_FILES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

async function validateEmailSignatureBypassParam(s: string | null): Promise<boolean> {
  if (!s) return false;
  if (!/^[A-Za-z0-9\-_]+$/.test(s)) return false;

  let payloadRaw = '';
  try {
    payloadRaw = decodeBase64Url(s);
  } catch {
    return false;
  }

  try {
    const payload = JSON.parse(payloadRaw) as Record<string, unknown>;
    const payloadHash = typeof payload.hash === 'string' ? payload.hash : '';
    const configuredHash = (process.env.SIGNATURE_BYPASS_HASH ?? '').trim();
    const secretKey = (process.env.SIGNATURE_SECRET_KEY ?? '').trim();
    const expectedHash = configuredHash || (secretKey ? await deriveBypassHash(secretKey) : '');
    if (!payloadHash || !expectedHash) return false;
    return timingSafeStringCompare(payloadHash, expectedHash);
  } catch {
    return false;
  }
}

function redirectToLogin(req: NextRequest): NextResponse {
  const url = new URL('/login', req.url);
  url.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

function hasSessionCookie(req: NextRequest): boolean {
  const cookieNames = req.cookies.getAll().map((cookie) => cookie.name);
  return cookieNames.some(
    (cookieName) =>
      SESSION_COOKIE_NAMES.includes(cookieName as (typeof SESSION_COOKIE_NAMES)[number]) ||
      SESSION_COOKIE_PREFIXES.some((prefix) => cookieName.startsWith(prefix))
  );
}

export async function middleware(req: NextRequest) {
  if (isDevelopmentAuthBypassEnabled()) {
    // Development convenience: bypass middleware auth gates during `npm run dev`.
    return NextResponse.next();
  }

  const { pathname, searchParams } = req.nextUrl;
  if (shouldSkipAuth(pathname)) return NextResponse.next();

  // Special bypass for /email-signature with valid signed payload in ?s.
  if (pathname === '/email-signature' && (await validateEmailSignatureBypassParam(searchParams.get('s')))) {
    return NextResponse.next();
  }

  // Do not import next-auth/jwt in middleware edge runtime to avoid
  // jose CompressionStream/DecompressionStream warnings during Vercel builds.
  // Route/page handlers still perform full auth and role checks server-side.
  if (!hasSessionCookie(req)) {
    return redirectToLogin(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
