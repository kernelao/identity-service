import { DomainEvent } from '@/domain/shared/base/DomainEvent';
import { RefreshSessionId } from '@/domain/authn/sessions/value-objects/RefreshSessionId';
import { RefreshTokenFamilyId } from '@/domain/authn/sessions/value-objects/RefreshTokenFamilyId';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

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
