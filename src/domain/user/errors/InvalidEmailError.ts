import { DomainError } from '@/domain/shared/DomainError';

/**
 * InvalidEmailError
 * -----------------
 * Erreur métier levée quand un email ne respecte pas la politique de validation du domain.
 * (La forme exacte est un choix métier, pas une règle HTTP.)
 */
export class InvalidEmailError extends DomainError {
  readonly code = 'INVALID_EMAIL';

  constructor(message = 'Email invalide') {
    super(message);
  }
}
