import { DomainEvent } from '@/domain/shared/DomainEvent';
import { RefreshTokenFamilyId } from '@/domain/token/RefreshTokenFamilyId';
import { UserId } from '@/domain/user/UserId';

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
