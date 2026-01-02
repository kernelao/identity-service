import { DomainEvent } from '@/domain/shared/base/DomainEvent';
import { UserId } from '@/domain/authn/account/value-objects/UserId';
import { StoreId } from '@/domain/authz/memberships/value-objects/StoreId';
import { Role } from '@/domain/authz/memberships/value-objects/Role';
import { Scope } from '@/domain/authz/memberships/value-objects/Scope';

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
