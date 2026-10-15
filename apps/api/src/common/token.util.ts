import { createHash, randomBytes } from 'node:crypto';

/**
 * Generate a cryptographically-random, URL-safe opaque token (the value mailed
 * to the user). 32 bytes → 256 bits of entropy.
 */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/**
 * Deterministic hash stored in the DB for email/reset tokens.
 *
 * Random high-entropy tokens do NOT need a slow password hash (argon2): they are
 * not guessable and are single-use. A plain SHA-256 lets us look the token up by
 * its UNIQUE `tokenHash` column with a single indexed `findUnique`, instead of
 * loading N rows and running argon2.verify on each — which both broke correctness
 * past 50 outstanding tokens and was a CPU-exhaustion vector on the unauthenticated
 * reset/verify endpoints.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
