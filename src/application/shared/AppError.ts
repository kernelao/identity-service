/**
 * AppError
 * --------
 * Erreurs applicatives (orchestration) — distinctes des DomainError.
 *
 * - DomainError = invariant métier (domain/)
 * - AppError    = règles d'exécution / sécurité / accès / idempotency (application/)
 *
 * La traduction en HTTP (status, message) se fait dans interfaces/.
 */
export abstract class AppError extends Error {
  abstract readonly code: string;

  protected constructor(message?: string) {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED';

  constructor(message = 'Unauthorized') {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  readonly code = 'FORBIDDEN';

  constructor(message = 'Forbidden') {
    super(message);
  }
}

export class ConflictError extends AppError {
  readonly code = 'CONFLICT';

  constructor(message = 'Conflict') {
    super(message);
  }
}

export class TooManyRequestsError extends AppError {
  readonly code = 'TOO_MANY_REQUESTS';

  constructor(message = 'Too many requests') {
    super(message);
  }
}
