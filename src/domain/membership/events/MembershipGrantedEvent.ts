import { DomainEvent } from '@/domain/shared/DomainEvent';
import { UserId } from '@/domain/user/UserId';
import { StoreId } from '@/domain/membership/StoreId';
import { Role } from '@/domain/membership/Role';
import { Scope } from '@/domain/membership/Scope';

/**
 * MembershipGrantedEvent
 * ----------------------
 * Fait métier : un user vient d'obtenir un membership (ou une mise à jour) pour un store.
 * Utile pour outbox / audit / propagation future.
 */
export class MembershipGrantedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly userId: UserId,
    readonly storeId: StoreId,
    readonly roles: Role[],
    readonly scopes: Scope[],
  ) {
    this.occurredAt = new Date();
  }
}
