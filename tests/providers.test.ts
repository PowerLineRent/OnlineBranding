import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getSsoProvidersFromEnv } from '@/lib/auth/providers';

describe('getSsoProvidersFromEnv', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('parses valid provider config', () => {
    vi.stubEnv(
      'SSO_PROVIDERS_JSON',
      JSON.stringify({
        ms_plrei: {
          type: 'microsoft',
          clientId: 'id',
          clientSecret: 'secret',
          tenantId: 'tenant',
        },
      })
    );

    const providers = getSsoProvidersFromEnv();
    expect(providers).toHaveLength(1);
    expect(providers[0].id).toBe('ms_plrei');
  });

  it('returns empty list on invalid json', () => {
    vi.stubEnv('SSO_PROVIDERS_JSON', '{invalid');
    expect(getSsoProvidersFromEnv()).toEqual([]);
  });
});
