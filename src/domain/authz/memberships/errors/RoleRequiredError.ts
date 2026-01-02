import { DomainError } from '@/domain/shared/base/DomainError';

/**
 * RoleRequiredError
 * -----------------
 * Un Membership doit contenir au moins 1 rôle.
 */
export class RoleRequiredError extends DomainError {
  readonly code = 'ROLE_REQUIRED';

  constructor(message = 'Au moins un rôle est requis') {
    super(message);
  }
}
