import { prisma } from '@/lib/prisma';
import { extractDomain, normalizeEmail } from '@/lib/security';

export type DiscoverResult = { mode: 'password' } | { mode: 'sso'; providerId: string };
type MappingLike = {
  providerKey: string;
  isActive: boolean;
  enforceSso: boolean;
} | null;

const DEFAULT_ADMIN_EMAIL = 'admin@plrei.com';

export function resolveDiscoverMode(input: {
  email: string;
  adminEmail?: string;
  domainMapping: MappingLike;
}): DiscoverResult {
  const normalizedEmail = normalizeEmail(input.email);
  const adminEmail = normalizeEmail(input.adminEmail ?? process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL);
  if (normalizedEmail === adminEmail) {
    return { mode: 'password' };
  }
  if (!input.domainMapping || !input.domainMapping.isActive || !input.domainMapping.enforceSso) {
    return { mode: 'password' };
  }
  return { mode: 'sso', providerId: input.domainMapping.providerKey };
}

export async function discoverAuthMode(rawEmail: string): Promise<DiscoverResult> {
  const email = normalizeEmail(rawEmail);
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL);

  const domain = extractDomain(email);
  if (!domain) {
    return { mode: 'password' };
  }

  const mapping = await prisma.ssoDomainMapping.findUnique({
    where: { domain },
  });

  return resolveDiscoverMode({
    email,
    adminEmail,
    domainMapping: mapping
      ? { providerKey: mapping.providerKey, isActive: mapping.isActive, enforceSso: mapping.enforceSso }
      : null,
  });
}
