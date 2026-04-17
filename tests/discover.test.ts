import { describe, expect, it } from 'vitest';
import { resolveDiscoverMode } from '@/lib/auth/discover';

describe('resolveDiscoverMode', () => {
  it('forces admin email to password mode', () => {
    const result = resolveDiscoverMode({
      email: 'admin@plrei.com',
      adminEmail: 'admin@plrei.com',
      domainMapping: { providerKey: 'ms_plrei', enforceSso: true, isActive: true },
    });
    expect(result).toEqual({ mode: 'password' });
  });

  it('returns sso mode for active enforced mapping', () => {
    const result = resolveDiscoverMode({
      email: 'user@plrei.com',
      domainMapping: { providerKey: 'ms_plrei', enforceSso: true, isActive: true },
    });
    expect(result).toEqual({ mode: 'sso', providerId: 'ms_plrei' });
  });

  it('returns password for inactive mapping', () => {
    const result = resolveDiscoverMode({
      email: 'user@plrei.com',
      domainMapping: { providerKey: 'ms_plrei', enforceSso: true, isActive: false },
    });
    expect(result).toEqual({ mode: 'password' });
  });
});
