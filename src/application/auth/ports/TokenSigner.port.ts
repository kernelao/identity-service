import { JwtClaims } from '@/application/auth/JwtClaims';

/**
 * TokenSignerPort
 * ---------------
 * Signature d'access token (JWT).
 * Implémenté en infra (ex: jose/jsonwebtoken + secret K8s).
 */
export interface TokenSignerPort {
  signAccessToken(params: { claims: JwtClaims; expiresInSeconds: number }): Promise<string>;
}
