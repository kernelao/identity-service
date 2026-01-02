import type { JwtClaims } from '@/application/authn/services/JwtClaims';

/**
 * JwtVerifierPort
 * --------------
 * Vérifie un access token (RS256) et retourne les claims.
 */
export interface JwtVerifierPort {
  verifyAccessToken(params: { token: string }): Promise<JwtClaims>;
}
