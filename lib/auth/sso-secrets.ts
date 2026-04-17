import crypto from 'crypto';

const ENCRYPTION_ALGO = 'aes-256-gcm';

function getEncryptionKeyMaterial(): string {
  return (process.env.SSO_ENCRYPTION_KEY ?? process.env.AUTH_SECRET ?? '').trim();
}

function getEncryptionKey(): Buffer | null {
  const material = getEncryptionKeyMaterial();
  if (!material) return null;
  return crypto.createHash('sha256').update(material, 'utf8').digest();
}

export function hasSsoEncryptionKey(): boolean {
  return Boolean(getEncryptionKey());
}

export function encryptSsoSecret(value: string): string | null {
  const key = getEncryptionKey();
  if (!key) return null;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${ciphertext.toString('base64url')}`;
}

export function decryptSsoSecret(payload: string): string | null {
  const key = getEncryptionKey();
  if (!key || !payload) return null;

  const [version, ivB64, tagB64, dataB64] = payload.split('.');
  if (version !== 'v1' || !ivB64 || !tagB64 || !dataB64) return null;

  try {
    const iv = Buffer.from(ivB64, 'base64url');
    const tag = Buffer.from(tagB64, 'base64url');
    const data = Buffer.from(dataB64, 'base64url');
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGO, key, iv);
    decipher.setAuthTag(tag);
    const clear = Buffer.concat([decipher.update(data), decipher.final()]);
    return clear.toString('utf8');
  } catch {
    return null;
  }
}
