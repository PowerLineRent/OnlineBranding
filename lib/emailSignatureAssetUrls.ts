const DEFAULT_REPO_BASE =
  'https://raw.githubusercontent.com/PowerLineRent/OnlineBranding/refs/heads/main';

const REPO_BASE = process.env.NEXT_PUBLIC_PLREI_ICON_REPO_BASE ?? DEFAULT_REPO_BASE;
const NEW_ASSET_DIR = process.env.NEXT_PUBLIC_PLREI_ICON_NEW_DIR ?? 'public/EmailSignature';
const LEGACY_ASSET_DIR = process.env.NEXT_PUBLIC_PLREI_ICON_OLD_DIR ?? 'EmailSignature';

const resolvedUrlCache = new Map<string, Promise<string>>();

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

function buildAssetUrl(dir: string, fileName: string): string {
  return `${trimSlashes(REPO_BASE)}/${trimSlashes(dir)}/${fileName}`;
}

export function getEmailSignatureAssetCandidates(fileName: string): {
  preferred: string;
  legacy: string;
} {
  return {
    preferred: buildAssetUrl(NEW_ASSET_DIR, fileName),
    legacy: buildAssetUrl(LEGACY_ASSET_DIR, fileName),
  };
}

export function getPreferredEmailSignatureAssetUrl(fileName: string): string {
  return getEmailSignatureAssetCandidates(fileName).preferred;
}

export function getLegacyEmailSignatureAssetUrl(fileName: string): string {
  return getEmailSignatureAssetCandidates(fileName).legacy;
}

export function getEmailSignatureIconFileName(name: string): string {
  return `icon-${name}.png`;
}

async function isUrlAvailable(url: string): Promise<boolean> {
  try {
    const headResponse = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (headResponse.ok) {
      return true;
    }

    // Some hosts reject HEAD; perform a tiny GET probe as a fallback.
    if (headResponse.status === 405 || headResponse.status === 403) {
      const getResponse = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        cache: 'no-store',
      });
      return getResponse.ok;
    }

    return false;
  } catch {
    return false;
  }
}

export async function resolveEmailSignatureAssetUrl(fileName: string): Promise<string> {
  const cacheKey = fileName;
  const cached = resolvedUrlCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const resolution = (async () => {
    const { preferred, legacy } = getEmailSignatureAssetCandidates(fileName);

    // Forward path: use the new public/EmailSignature location whenever available.
    if (await isUrlAvailable(preferred)) {
      return preferred;
    }

    // Backward compatibility path: fall back to legacy EmailSignature location.
    // Safe to remove once all icon files are confirmed present in public/EmailSignature
    // on main and no deployed clients rely on legacy EmailSignature URLs.
    if (await isUrlAvailable(legacy)) {
      return legacy;
    }

    // If both probes fail (network/transient), keep the forward URL as default.
    return preferred;
  })();

  resolvedUrlCache.set(cacheKey, resolution);
  return resolution;
}

export async function resolveEmailSignatureAssetUrls(
  fileNames: readonly string[]
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    fileNames.map(async (fileName) => [fileName, await resolveEmailSignatureAssetUrl(fileName)] as const)
  );
  return Object.fromEntries(entries);
}
