/**
 * RateLimiterPort
 * ---------------
 * Rate limiting logique (application) en plus du rate limiting infra (gateway/ingress).
 *
 * Ex: login brute-force:
 * - par IP hash
 * - par email (hash)
 * - par userId si connu
 */
export interface RateLimiterPort {
  /**
   * Consomme 1 "token" dans un bucket.
   * Retourne false si la limite est dépassée.
   */
  consume(params: { key: string; limit: number; windowSeconds: number }): Promise<boolean>;
}
