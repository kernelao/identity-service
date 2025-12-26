import type { JwtClaims } from '@/application/auth/JwtClaims';

/**
 * JwtVerifierPort
 * --------------
 * Vérifie un access token (RS256) et retourne les claims.
 */
export interface JwtVerifierPort {
  verifyAccessToken(params: { token: string }): Promise<JwtClaims>;
}
