import crypto from 'crypto';

/**
 * Verifies the Helio webhook signature.
 * Helio uses HMAC-SHA256 with a shared secret.
 */
export function verifyHelioSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.HELIO_WEBHOOK_SECRET;

  if (!secret) {
    console.warn("HELIO_WEBHOOK_SECRET is not set. Security check skipped (NOT RECOMMENDED FOR PRODUCTION).");
    return true; 
  }

  if (!signature) return false;

  try {
    const hmac = crypto.createHmac('sha256', secret);
    const computedSignature = hmac.update(rawBody).digest('hex');

    // Use timingSafeEqual to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (err) {
    console.error('Error verifying Helio signature:', err);
    return false;
  }
}
