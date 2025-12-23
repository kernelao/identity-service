import { DomainError } from '@/domain/shared/DomainError';

/**
 * InvalidScopeError
 * -----------------
 * Scope non autorisé pour les rôles attribués.
 */
export class InvalidScopeError extends DomainError {
  readonly code = 'INVALID_SCOPE';

  constructor(message = 'Scope invalide pour les rôles attribués') {
    super(message);
  }
}
