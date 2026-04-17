/**
 * Reusable PLREI icon resolver for Node.js/Express email template systems.
 *
 * Integration points:
 * 1) Build-time pre-resolution for static template payloads:
 *    - Call `resolveIconUrlMap([...])` in build scripts and inject resolved URLs into generated templates.
 * 2) Runtime resolution in API/template rendering:
 *    - Call `resolveIconUrl("address")` (or other icon name) before rendering HTML.
 * 3) Template engines:
 *    - Handlebars: register `createHandlebarsIconHelper(...)` and use `{{plreiIconUrl "address"}}`
 *    - Liquid: register `createLiquidIconFilter(...)` and use `{{ "address" | plrei_icon_url }}`
 */

const DEFAULT_REPO_BASE =
  'https://raw.githubusercontent.com/PowerLineRent/OnlineBranding/refs/heads/main';

const DEFAULT_NEW_DIR = 'public/EmailSignature';
const DEFAULT_LEGACY_DIR = 'EmailSignature';

export type EmailIconResolverOptions = {
  repoBase?: string;
  newDir?: string;
  legacyDir?: string;
  fetchImpl?: typeof fetch;
};

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

function normalizeOptions(options?: EmailIconResolverOptions) {
  const repoBase = trimSlashes(options?.repoBase ?? DEFAULT_REPO_BASE);
  const newDir = trimSlashes(options?.newDir ?? DEFAULT_NEW_DIR);
  const legacyDir = trimSlashes(options?.legacyDir ?? DEFAULT_LEGACY_DIR);
  const fetchImpl = options?.fetchImpl ?? fetch;

  return { repoBase, newDir, legacyDir, fetchImpl };
}

export function toIconFileName(iconName: string): string {
  return iconName.endsWith('.png') ? iconName : `icon-${iconName}.png`;
}

export function getIconUrlCandidates(
  iconName: string,
  options?: EmailIconResolverOptions
): { preferred: string; legacy: string } {
  const { repoBase, newDir, legacyDir } = normalizeOptions(options);
  const fileName = toIconFileName(iconName);
  return {
    preferred: `${repoBase}/${newDir}/${fileName}`,
    legacy: `${repoBase}/${legacyDir}/${fileName}`,
  };
}

async function isUrlAvailable(url: string, fetchImpl: typeof fetch): Promise<boolean> {
  try {
    const head = await fetchImpl(url, { method: 'HEAD', cache: 'no-store' });
    if (head.ok) {
      return true;
    }

    if (head.status === 405 || head.status === 403) {
      const get = await fetchImpl(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        cache: 'no-store',
      });
      return get.ok;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Runtime/build-time resolver:
 * - Checks new location first (/public/EmailSignature/icon-[name].png)
 * - Falls back to legacy location (/EmailSignature/icon-[name].png)
 */
export async function resolveIconUrl(
  iconName: string,
  options?: EmailIconResolverOptions
): Promise<string> {
  const { fetchImpl } = normalizeOptions(options);
  const { preferred, legacy } = getIconUrlCandidates(iconName, options);

  if (await isUrlAvailable(preferred, fetchImpl)) {
    return preferred;
  }
  if (await isUrlAvailable(legacy, fetchImpl)) {
    return legacy;
  }

  // Network/transient fallback: keep new URL as canonical default.
  return preferred;
}

export async function resolveIconUrlMap(
  iconNames: readonly string[],
  options?: EmailIconResolverOptions
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    iconNames.map(async (name) => [name, await resolveIconUrl(name, options)] as const)
  );
  return Object.fromEntries(entries);
}

/**
 * Handlebars helper factory.
 * Usage (Express Handlebars):
 *   hbs.handlebars.registerHelper('plreiIconUrl', createHandlebarsIconHelper(preResolvedMap, options));
 *   Template: {{plreiIconUrl "address"}}
 */
export function createHandlebarsIconHelper(
  preResolvedMap?: Record<string, string>,
  options?: EmailIconResolverOptions
) {
  return (iconName: string) => {
    const resolved = preResolvedMap?.[iconName];
    if (resolved) {
      return resolved;
    }
    return getIconUrlCandidates(iconName, options).preferred;
  };
}

/**
 * Liquid filter factory.
 * Usage (LiquidJS or compatible):
 *   engine.registerFilter('plrei_icon_url', createLiquidIconFilter(preResolvedMap, options));
 *   Template: {{ "address" | plrei_icon_url }}
 */
export function createLiquidIconFilter(
  preResolvedMap?: Record<string, string>,
  options?: EmailIconResolverOptions
) {
  return (iconName: string) => {
    const normalized = String(iconName);
    const resolved = preResolvedMap?.[normalized];
    if (resolved) {
      return resolved;
    }
    return getIconUrlCandidates(normalized, options).preferred;
  };
}

