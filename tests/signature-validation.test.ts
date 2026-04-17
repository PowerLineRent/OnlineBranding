import crypto from 'crypto';
import { describe, expect, it, beforeEach } from 'vitest';
import { SignatureValidationError, validateEmailSignature } from '@/lib/signature-validation';

describe('validateEmailSignature', () => {
  beforeEach(() => {
    process.env.SIGNATURE_SECRET_KEY = 'test-signature-secret';
  });

  it('returns true for valid signature payload and hash', () => {
    const payloadJson = JSON.stringify({ email: 'jackveney@plrei.com', name: 'Jack Veney' });
    const s = Buffer.from(payloadJson, 'utf8').toString('base64url');
    const h = crypto.createHmac('sha256', process.env.SIGNATURE_SECRET_KEY!).update(payloadJson, 'utf8').digest('hex');
    expect(validateEmailSignature(s, h)).toBe(true);
  });

  it('throws missing signature error', () => {
    expect(() => validateEmailSignature('', 'abc')).toThrowError(SignatureValidationError);
  });

  it('throws hash mismatch', () => {
    const payloadJson = JSON.stringify({ email: 'jackveney@plrei.com' });
    const s = Buffer.from(payloadJson, 'utf8').toString('base64url');
    expect(() => validateEmailSignature(s, 'deadbeef')).toThrowError(SignatureValidationError);
  });

  it('throws malformed json when decoded payload is not json', () => {
    const payload = Buffer.from('hello-world', 'utf8').toString('base64url');
    const h = crypto.createHmac('sha256', process.env.SIGNATURE_SECRET_KEY!).update('hello-world', 'utf8').digest('hex');
    expect(() => validateEmailSignature(payload, h)).toThrowError(SignatureValidationError);
  });
});
