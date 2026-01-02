/**
 * PasswordHasherPort
 * ------------------
 * Abstraction infra du hashing/verif (Argon2id recommandé).
 * Le domain ne hash jamais.
 */
export interface PasswordHasherPort {
  hash(raw: string): Promise<string>;
}
