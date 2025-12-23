import { DomainError } from '@/domain/shared/DomainError';

/**
 * InvalidStoreIdError
 * -------------------
 * storeId manquant ou invalide.
 * Critique pour la Golden Rule multi-tenant.
 */
export class InvalidStoreIdError extends DomainError {
  readonly code = 'INVALID_STORE_ID';

  constructor(message = 'storeId invalide') {
    super(message);
  }
}
