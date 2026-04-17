import type { Session } from 'next-auth';
import { normalizeEmail } from '@/lib/security';

export const DEFAULT_ADMIN_EMAIL = 'admin@plrei.com';

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const configuredAdminEmail = normalizeEmail(process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL);
  return normalizeEmail(email) === configuredAdminEmail;
}

export function isAdminSession(session: Session | null): boolean {
  if (!session?.user) return false;
  return session.user.role === 'admin' || isAdminEmail(session.user.email);
}
