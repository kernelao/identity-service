/**
 * RefreshTokenHasherPort
 * ----------------------
 * Hash un refresh token opaque pour stockage (jamais le token en clair en DB).
 * Implémentation infra recommandée: SHA-256 (rapide) + pepper (secret).
 */
export interface RefreshTokenHasherPort {
  hash(token: string): Promise<string>;
}
