import { PasswordTooWeakError } from '@/domain/authn/credentials/errors/PasswordTooWeakError';

/**
 * PasswordPolicy
 * --------------
 * Règles métier minimales pour accepter un mot de passe en V1.
 *
 * !!! Le hashing (Argon2) est INFRA, pas domain.
 * Ici on valide seulement la "qualité" du mot de passe brut.
 */
export class PasswordPolicy {
  static validate(raw: string): void {
    const value = raw ?? '';

    // MVP: simple mais solide (on renforcera si besoin).
    if (value.length < 12) throw new PasswordTooWeakError('Minimum 12 caractères');

    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasDigit = /[0-9]/.test(value);

    if (!hasLower || !hasUpper || !hasDigit) {
      throw new PasswordTooWeakError(
        'Doit contenir au moins une minuscule, une majuscule et un chiffre',
      );
    }
  }
}
