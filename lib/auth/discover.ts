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
  if (email === adminEmail) {
    return { mode: 'password' };
  }

  const domain = extractDomain(email);
  if (!domain) {
    return { mode: 'password' };
  }

  let mapping: Awaited<ReturnType<typeof prisma.ssoDomainMapping.findUnique>> = null;
  try {
    mapping = await prisma.ssoDomainMapping.findUnique({
      where: { domain },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const missingMappingTable =
      message.includes('SsoDomainMapping') ||
      message.includes('does not exist') ||
      message.includes('relation') ||
      message.includes('P2021') ||
      message.includes('P2022');

    if (missingMappingTable) {
      console.warn('[auth][discover] SsoDomainMapping unavailable; defaulting to password mode.', {
        domain,
      });
      return { mode: 'password' };
    }
    throw error;
  }

  return resolveDiscoverMode({
    email,
    adminEmail,
    domainMapping: mapping
      ? { providerKey: mapping.providerKey, isActive: mapping.isActive, enforceSso: mapping.enforceSso }
      : null,
  });
}
