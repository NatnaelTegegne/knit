import 'server-only';

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

/**
 * Symmetric encryption for credential values.
 *
 * Stored format: `v1.<iv>.<authTag>.<ciphertext>`, all base64url.
 * The version prefix means the scheme can change later without orphaning rows.
 *
 * This keeps secrets out of the database in plaintext, which is the bar for
 * this stage of the project. It is NOT a substitute for a real secrets manager:
 * the key sits in an environment variable, so anyone who can read the
 * environment can decrypt everything. Moving to AWS Secrets Manager (or KMS
 * envelope encryption) is the intended next step.
 */

const SCHEME = 'v1';
const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12; // 96-bit nonce, the GCM standard
const KEY_BYTES = 32;

// Fixed salt: the env var is already high-entropy, and a per-value salt would
// have to be stored alongside the ciphertext for no real gain here.
const SALT = 'knit.credential.v1';

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const secret = process.env.CREDENTIAL_ENCRYPTION_KEY;

  if (!secret) {
    throw new Error(
      'CREDENTIAL_ENCRYPTION_KEY is not set. Credentials cannot be encrypted or decrypted. ' +
        'Generate one with: openssl rand -base64 32'
    );
  }

  if (secret.length < 32) {
    throw new Error(
      'CREDENTIAL_ENCRYPTION_KEY is too short (need at least 32 characters). ' +
        'Generate one with: openssl rand -base64 32'
    );
  }

  cachedKey = scryptSync(secret, SALT, KEY_BYTES);
  return cachedKey;
}

/** Encrypt a plaintext secret for storage. */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    SCHEME,
    iv.toString('base64url'),
    authTag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

/**
 * Decrypt a stored credential value.
 * Throws if the value was tampered with, or encrypted under a different key.
 */
export function decrypt(stored: string): string {
  const parts = stored.split('.');

  if (parts.length !== 4 || parts[0] !== SCHEME) {
    throw new Error('Stored credential is not in the expected encrypted format');
  }

  const [, ivPart, tagPart, dataPart] = parts;

  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivPart, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));

  try {
    return Buffer.concat([
      decipher.update(Buffer.from(dataPart, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    // GCM auth failure: wrong key, or the ciphertext was modified
    throw new Error(
      'Failed to decrypt credential. The encryption key may have changed.'
    );
  }
}

/**
 * A display-safe hint, e.g. "sk-…7f3a". Used so the UI can show which key is
 * stored without ever sending the secret to the browser.
 */
export function maskSecret(plaintext: string): string {
  if (plaintext.length <= 8) return '••••';
  return `${plaintext.slice(0, 3)}…${plaintext.slice(-4)}`;
}
