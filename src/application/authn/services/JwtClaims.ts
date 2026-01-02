/**
 * JwtClaims
 * ---------
 * Projection applicative (technique) du modèle métier vers un JWT.
 *
 * - sub = userId
 * - stores = liste des stores auxquels le user est lié + roles/scopes
 * - iat/exp/jti = standard
 */
export type JwtClaims = {
  sub: string;
  stores: {
    storeId: string;
    roles: string[];
    scopes: string[];
  }[];
  iat: number;
  exp: number;
  jti: string;
};
