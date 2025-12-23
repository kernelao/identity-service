import { DomainEvent } from '@/domain/shared/DomainEvent';
import { UserId } from '@/domain/user/UserId';

/**
 * UserDisabledEvent
 * -----------------
 * Fait métier : le compte a été désactivé.
 * Utile pour audit, sécurité, ou révoquer des sessions côté application.
 */
export class UserDisabledEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(readonly userId: UserId) {
    this.occurredAt = new Date();
  }
}
