import { createHmac, timingSafeEqual } from 'node:crypto';

// Reject signatures older than this to blunt replay attacks (Stripe's default)
export const SIGNATURE_TOLERANCE_SECONDS = 60 * 5;

export type SignatureResult = { ok: true } | { ok: false; reason: string };

/**
 * Verify a `Stripe-Signature` header against the raw request body.
 *
 * Implements Stripe's documented scheme directly so the app doesn't need the
 * Stripe SDK: HMAC-SHA256 over `${timestamp}.${payload}`, compared against
 * every `v1` signature in the header.
 */
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  nowSeconds: number = Date.now() / 1000
): SignatureResult {
  if (!header) {
    return { ok: false, reason: 'Missing Stripe-Signature header' };
  }

  let timestamp: string | undefined;
  const signatures: string[] = [];

  for (const part of header.split(',')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;

    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();

    if (key === 't') timestamp = value;
    if (key === 'v1' && value) signatures.push(value);
  }

  if (!timestamp || signatures.length === 0) {
    return { ok: false, reason: 'Malformed Stripe-Signature header' };
  }

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) {
    return { ok: false, reason: 'Malformed Stripe-Signature timestamp' };
  }

  if (Math.abs(nowSeconds - timestampSeconds) > SIGNATURE_TOLERANCE_SECONDS) {
    return { ok: false, reason: 'Signature timestamp outside tolerance' };
  }

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`, 'utf8')
    .digest();

  const matched = signatures.some((signature) => {
    // Non-hex characters would silently truncate the buffer, so reject early
    if (!/^[0-9a-fA-F]+$/.test(signature)) return false;

    const provided = Buffer.from(signature, 'hex');
    // timingSafeEqual throws on length mismatch, so guard first
    return (
      provided.length === expected.length && timingSafeEqual(provided, expected)
    );
  });

  return matched ? { ok: true } : { ok: false, reason: 'Signature mismatch' };
}

/**
 * Build a `Stripe-Signature` header for a payload. Used by tests and by the
 * local webhook-simulation script; Stripe itself produces this in production.
 */
export function signStripePayload(
  payload: string,
  secret: string,
  timestampSeconds: number = Math.floor(Date.now() / 1000)
): string {
  const signature = createHmac('sha256', secret)
    .update(`${timestampSeconds}.${payload}`, 'utf8')
    .digest('hex');

  return `t=${timestampSeconds},v1=${signature}`;
}
