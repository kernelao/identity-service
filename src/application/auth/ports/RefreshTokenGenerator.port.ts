/**
 * RefreshTokenGeneratorPort
 * -------------------------
 * Génère un refresh token opaque (string aléatoire).
 * Implémentation infra recommandée: crypto.randomBytes().
 */
export interface RefreshTokenGeneratorPort {
  generate(): Promise<string>;
}
