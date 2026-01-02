import { PasswordHash } from '@/domain/authn/credentials/value-objects/PasswordHash';

/**
 * PasswordVerifierPort
 * --------------------
 * Vérifie un mot de passe brut contre un hash stocké.
 * Implémentation infra: Argon2 verify.
 */
export interface PasswordVerifierPort {
  verify(params: { raw: string; hash: PasswordHash }): Promise<boolean>;
}
