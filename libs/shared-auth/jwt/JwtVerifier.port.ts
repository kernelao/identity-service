/**
 * JwtVerifierPort
 * ----------------
 * Port pour vérifier un ACCESS TOKEN (JWT) émis par Identity.
 */
export interface JwtVerifierPort {
  verifyAccessToken(params: { token: string }): Promise<JwtAccessClaims>;
}

/**
 * Claims attendus dans ton access token.
 */
export type JwtAccessClaims = {
  sub: string; // userId
  stores: Array<{
    storeId: string;
    roles: string[];
    scopes: string[];
  }>;
  jti: string;
  iat: number;
  exp: number;
};
