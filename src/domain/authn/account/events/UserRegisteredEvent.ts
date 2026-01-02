import { DomainEvent } from '@/domain/shared/base/DomainEvent';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

/**
 * UserRegisteredEvent
 * -------------------
 * Fait métier : un user vient d'être créé (register).
 * Peut alimenter l'outbox plus tard (notifications, analytics, etc.).
 */
export class UserRegisteredEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(readonly userId: UserId) {
    this.occurredAt = new Date();
  }
}
