import { PasswordHash } from '@/domain/credential/PasswordHash';

/**
 * PasswordVerifierPort
 * --------------------
 * Vérifie un mot de passe brut contre un hash stocké.
 * Implémentation infra: Argon2 verify.
 */
export interface PasswordVerifierPort {
  verify(params: { raw: string; hash: PasswordHash }): Promise<boolean>;
}
