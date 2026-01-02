import { DomainError } from '@/domain/shared/base/DomainError';

/**
 * InvalidPasswordHashError
 * ------------------------
 * Erreur métier levée si un hash de mot de passe est invalide/mal formé.
 * Utile pour détecter une corruption de donnée ou une mauvaise intégration infra.
 */
export class InvalidPasswordHashError extends DomainError {
  readonly code = 'INVALID_PASSWORD_HASH';

  constructor(message = 'Hash de mot de passe invalide') {
    super(message);
  }
}
