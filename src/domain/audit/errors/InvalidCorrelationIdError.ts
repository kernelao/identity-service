import { DomainError } from '@/domain/shared/base/DomainError';

/**
 * InvalidCorrelationIdError
 * -------------------------
 * Le correlationId sert à tracer une requête end-to-end.
 * On le valide au niveau domain pour garder des logs exploitables.
 */
export class InvalidCorrelationIdError extends DomainError {
  readonly code = 'INVALID_CORRELATION_ID';

  constructor(message = 'correlationId invalide') {
    super(message);
  }
}
