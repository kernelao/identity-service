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
  readonly statusCode: number;

  protected constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// 400
export class BadRequestError extends AppError {
  readonly code = 'BAD_REQUEST';
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

// 401
export class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED';
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

// 403
export class ForbiddenError extends AppError {
  readonly code = 'FORBIDDEN';
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

// 404
export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

// 409
export class ConflictError extends AppError {
  readonly code = 'CONFLICT';
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

// 429
export class TooManyRequestsError extends AppError {
  readonly code = 'TOO_MANY_REQUESTS';
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

// 502
export class UpstreamError extends AppError {
  readonly code = 'UPSTREAM_ERROR';
  constructor(message = 'Upstream service error') {
    super(message, 502);
  }
}
