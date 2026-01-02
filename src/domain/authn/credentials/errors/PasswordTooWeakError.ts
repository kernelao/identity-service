import { DomainError } from '@/domain/shared/base/DomainError';

/**
 * PasswordTooWeakError
 * --------------------
 * Erreur métier levée quand un mot de passe ne respecte pas la policy.
 */
export class PasswordTooWeakError extends DomainError {
  readonly code = 'PASSWORD_TOO_WEAK';

  constructor(message = 'Mot de passe trop faible') {
    super(message);
  }
}
