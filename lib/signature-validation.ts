import crypto from 'crypto';
import { timingSafeEqualHex } from '@/lib/security';

export class SignatureValidationError extends Error {
  code: 'MISSING_SIGNATURE' | 'INVALID_BASE64' | 'MALFORMED_JSON' | 'HASH_MISMATCH' | 'MISSING_HASH';

  constructor(
    code: 'MISSING_SIGNATURE' | 'INVALID_BASE64' | 'MALFORMED_JSON' | 'HASH_MISMATCH' | 'MISSING_HASH',
    message: string
  ) {
    super(message);
    this.name = 'SignatureValidationError';
    this.code = code;
  }
}

export function decodeSignaturePayload(signatureParam: string): string {
  if (!signatureParam) {
    throw new SignatureValidationError('MISSING_SIGNATURE', 'Missing signature');
  }

  if (!/^[A-Za-z0-9\-_]+$/.test(signatureParam)) {
    throw new SignatureValidationError('INVALID_BASE64', 'Invalid base64');
  }

  const normalized = signatureParam.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);

  try {
    return Buffer.from(padded, 'base64').toString('utf8');
  } catch {
    throw new SignatureValidationError('INVALID_BASE64', 'Invalid base64');
  }
}

export function createSignatureHash(payloadJson: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(payloadJson, 'utf8').digest('hex');
}

export function validateEmailSignature(signatureParam: string, secretHash: string): boolean {
  if (!secretHash) {
    throw new SignatureValidationError('MISSING_HASH', 'Missing secret hash');
  }

  const secretKey = process.env.SIGNATURE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('SIGNATURE_SECRET_KEY is not configured.');
  }

  const payloadJson = decodeSignaturePayload(signatureParam);

  try {
    JSON.parse(payloadJson);
  } catch {
    throw new SignatureValidationError('MALFORMED_JSON', 'Malformed JSON');
  }

  const expectedHash = createSignatureHash(payloadJson, secretKey);
  if (!timingSafeEqualHex(expectedHash, secretHash.toLowerCase())) {
    throw new SignatureValidationError('HASH_MISMATCH', 'Hash mismatch');
  }

  return true;
}
