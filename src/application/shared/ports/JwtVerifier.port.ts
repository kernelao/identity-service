/**
 * JwtVerifierPort
 * ----------------
 * Port applicatif pour vérifier un ACCESS TOKEN (JWT) émis par Identity.
 *
 * Objectif:
 * - La couche "interfaces" (HTTP Guard) ne dépend pas de "jose" directement
 * - La vérification cryptographique reste en infra
 * - Le Guard obtient des claims typés pour construire le RequestContext
 */
export interface JwtVerifierPort {
  verifyAccessToken(params: { token: string }): Promise<JwtAccessClaims>;
}

/**
 * Claims attendus dans ton access token.
 * À ajuster si besoin d'ajout de d'autres champs.
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
