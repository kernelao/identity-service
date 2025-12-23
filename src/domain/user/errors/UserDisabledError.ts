import { DomainError } from '@/domain/shared/DomainError';

/**
 * UserDisabledError
 * -----------------
 * Erreur métier : un user désactivé ne peut pas s'authentifier / effectuer certaines actions.
 * La traduction en 403/401 se fera dans l'interface ou application layer.
 */
export class UserDisabledError extends DomainError {
  readonly code = 'USER_DISABLED';

  constructor(message = 'Utilisateur désactivé') {
    super(message);
  }
}
