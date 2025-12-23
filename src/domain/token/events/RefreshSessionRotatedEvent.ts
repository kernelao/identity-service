import { DomainEvent } from '@/domain/shared/DomainEvent';
import { RefreshSessionId } from '@/domain/token/RefreshSessionId';
import { RefreshTokenFamilyId } from '@/domain/token/RefreshTokenFamilyId';
import { UserId } from '@/domain/user/UserId';

/**
 * RefreshSessionRotatedEvent
 * -------------------------
 * Fait métier : rotation de refresh token effectuée (nouvelle session).
 *
 * Note : la détection de reuse est gérée au niveau application,
 * mais cet event sert pour audit/outbox.
 */
export class RefreshSessionRotatedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly userId: UserId,
    readonly familyId: RefreshTokenFamilyId,
    readonly newSessionId: RefreshSessionId,
  ) {
    this.occurredAt = new Date();
  }
}
