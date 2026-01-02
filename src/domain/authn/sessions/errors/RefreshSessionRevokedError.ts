import { DomainError } from '@/domain/shared/base/DomainError';

/**
 * RefreshSessionRevokedError
 * --------------------------
 * Erreur métier : une session révoquée ne peut plus être utilisée/rotée.
 */
export class RefreshSessionRevokedError extends DomainError {
  readonly code = 'REFRESH_SESSION_REVOKED';

  constructor(message = 'Session de refresh révoquée') {
    super(message);
  }
}
