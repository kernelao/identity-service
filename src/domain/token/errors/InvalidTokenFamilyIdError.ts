import { DomainError } from '@/domain/shared/DomainError';

/**
 * InvalidTokenFamilyIdError
 * -------------------------
 * Erreur métier : familyId manquant/invalide.
 */
export class InvalidTokenFamilyIdError extends DomainError {
  readonly code = 'INVALID_TOKEN_FAMILY_ID';

  constructor(message = 'Token familyId invalide') {
    super(message);
  }
}
