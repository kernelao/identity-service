import { DomainEvent } from '@/domain/shared/base/DomainEvent';
import { RefreshTokenFamilyId } from '@/domain/authn/sessions/value-objects/RefreshTokenFamilyId';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

/**
 * RefreshSessionRevokedEvent
 * -------------------------
 * Fait métier : une famille (ou une session) est révoquée.
 * Utilisé pour audit/outbox.
 */
export class RefreshSessionRevokedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly userId: UserId,
    readonly familyId: RefreshTokenFamilyId,
  ) {
    this.occurredAt = new Date();
  }
}
