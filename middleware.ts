import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = ['/login', '/invalid-link'];
const PUBLIC_PREFIXES = ['/api/auth', '/api/signature-link', '/_next', '/static'];
const PUBLIC_FILES = ['/favicon.ico', '/robots.txt', '/sitemap.xml'];
const DEFAULT_ADMIN_EMAIL = 'admin@plrei.com';

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

function redirectToHome(req: NextRequest): NextResponse {
  return NextResponse.redirect(new URL('/', req.url));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isAdminToken(token: unknown): boolean {
  if (!token || typeof token !== 'object') return false;
  const maybeToken = token as { role?: unknown; email?: unknown };
  const role = typeof maybeToken.role === 'string' ? maybeToken.role.toLowerCase() : '';
  if (role === 'admin') return true;
  const email = typeof maybeToken.email === 'string' ? normalizeEmail(maybeToken.email) : '';
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL);
  return Boolean(email) && email === adminEmail;
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (shouldSkipAuth(pathname)) return NextResponse.next();

  // Special bypass for /email-signature with valid signed payload in ?s.
  if (pathname === '/email-signature' && (await validateEmailSignatureBypassParam(searchParams.get('s')))) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  if (!token) {
    return redirectToLogin(req);
  }

  if (pathname.startsWith('/admin') && !isAdminToken(token)) {
    return redirectToHome(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
