import type { OAuthConfig } from 'next-auth/providers';
import { prisma } from '@/lib/prisma';
import { decryptSsoSecret } from '@/lib/auth/sso-secrets';

export type SsoProviderType = 'microsoft' | 'google';

type SsoProviderRecord = {
  type: SsoProviderType;
  name?: string;
  clientId: string;
  clientSecret: string;
  issuer?: string;
  tenantId?: string;
  authorization?: {
    params?: Record<string, string>;
  };
  scope?: string;
};

export type ParsedProvider = SsoProviderRecord & { id: string };

type DbConfigRow = {
  providerKey: string;
  type: string;
  displayName: string;
  clientId: string;
  clientSecretEncrypted: string;
  tenantId: string | null;
  issuer: string | null;
  scope: string;
  isActive: boolean;
};

const ALLOWED_PROVIDER_TYPES = new Set<SsoProviderType>(['google', 'microsoft']);

function parseJsonEnv<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizeType(type: string): SsoProviderType | null {
  const lowered = type.trim().toLowerCase();
  return ALLOWED_PROVIDER_TYPES.has(lowered as SsoProviderType) ? (lowered as SsoProviderType) : null;
}

function fromDbRow(row: DbConfigRow): ParsedProvider | null {
  const type = normalizeType(row.type);
  if (!type || !row.clientId || !row.clientSecretEncrypted) {
    return null;
  }

  const clientSecret = decryptSsoSecret(row.clientSecretEncrypted);
  if (!clientSecret) {
    return null;
  }

  return {
    id: row.providerKey,
    type,
    name: row.displayName,
    clientId: row.clientId,
    clientSecret,
    issuer: row.issuer ?? undefined,
    tenantId: row.tenantId ?? undefined,
    scope: row.scope || undefined,
  };
}

export function getSsoProvidersFromEnv(): ParsedProvider[] {
  const raw = process.env.SSO_PROVIDERS_JSON ?? '{}';
  const parsed = parseJsonEnv<Record<string, SsoProviderRecord>>(raw, {});

  return Object.entries(parsed)
    .filter(([, config]) => config?.clientId && config?.clientSecret && (config?.issuer || config?.tenantId))
    .map(([id, config]) => ({ ...config, id }));
}

export async function getSsoProvidersFromDb(): Promise<ParsedProvider[]> {
  try {
    const dbProviders = await prisma.ssoProviderConfig.findMany({
      where: { isActive: true },
      select: {
        providerKey: true,
        type: true,
        displayName: true,
        clientId: true,
        clientSecretEncrypted: true,
        tenantId: true,
        issuer: true,
        scope: true,
        isActive: true,
      },
      orderBy: { providerKey: 'asc' },
    });

    type DbRow = (typeof dbProviders)[number];
    return dbProviders
      .map((row: DbRow) => fromDbRow(row))
      .filter((provider: ParsedProvider | null): provider is ParsedProvider => provider !== null);
  } catch (error) {
    console.warn('[auth][providers] Failed to load DB-backed SSO providers. Falling back to env JSON.', {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

export async function getSsoProviders(): Promise<ParsedProvider[]> {
  const dbProviders = await getSsoProvidersFromDb();
  if (dbProviders.length > 0) {
    return dbProviders;
  }
  return getSsoProvidersFromEnv();
}

export async function getActiveProviderIds(): Promise<Set<string>> {
  const providers = await getSsoProviders();
  return new Set(providers.map((provider) => provider.id));
}

function buildIssuer(config: ParsedProvider): string {
  if (config.issuer) {
    return config.issuer;
  }
  if (config.type === 'microsoft' && config.tenantId) {
    return `https://login.microsoftonline.com/${config.tenantId}/v2.0`;
  }
  if (config.type === 'google') {
    return 'https://accounts.google.com';
  }
  throw new Error(`Provider ${config.id} is missing issuer configuration.`);
}

export function toAuthJsOauthProvider(config: ParsedProvider): OAuthConfig<Record<string, unknown>> {
  const issuer = buildIssuer(config);
  const scope = config.scope ?? 'openid profile email';

  return {
    id: config.id,
    name: config.name ?? config.id,
    type: 'oidc',
    issuer,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    authorization: config.authorization ?? { params: { scope } },
    checks: ['pkce', 'state'],
    profile(profile) {
      const email =
        (profile.email as string | undefined) ??
        (profile.preferred_username as string | undefined) ??
        '';
      return {
        id: (profile.sub as string | undefined) ?? email,
        email,
        name: (profile.name as string | undefined) ?? email,
      };
    },
  };
}
