import { AggregateRoot } from '@/domain/shared/AggregateRoot';
import { UniqueEntityId } from '@/domain/shared/UniqueEntityId';
import { RefreshSessionId } from '@/domain/token/RefreshSessionId';
import { RefreshTokenFamilyId } from '@/domain/token/RefreshTokenFamilyId';
import { RefreshSessionRevokedError } from '@/domain/token/errors/RefreshSessionRevokedError';
import { RefreshSessionRevokedEvent } from '@/domain/token/events/RefreshSessionRevokedEvent';
import { RefreshSessionRotatedEvent } from '@/domain/token/events/RefreshSessionRotatedEvent';
import { UserId } from '@/domain/user/UserId';

type RefreshSessionProps = {
  userId: UserId;
  familyId: RefreshTokenFamilyId;
  revokedAt?: Date;
  createdAt: Date;
  // Metadonnées non sensibles (aucun PII en clair) — utile pour audit.
  ipHash?: string;
  userAgentHash?: string;
};

/**
 * RefreshSession (Aggregate Root)
 * ------------------------------
 * Modélise le lifecycle d'une session de refresh token.
 *
 * Points clés :
 * - Une session appartient à une famille (familyId)
 * - Rotation : on crée une nouvelle session dans la même famille
 * - Révocation : bloque l'usage futur
 *
 * !!! Le domain ne connaît pas :
 * - le token brut
 * - le hash du token
 * - la DB
 * Ça vit en infrastructure/application.
 */
export class RefreshSession extends AggregateRoot<RefreshSessionProps> {
  private constructor(props: RefreshSessionProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get sessionId(): RefreshSessionId {
    return new RefreshSessionId(this.id.value);
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get familyId(): RefreshTokenFamilyId {
    return this.props.familyId;
  }

  get revokedAt(): Date | undefined {
    return this.props.revokedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /* ajout */
  get ipHash(): string | undefined {
    return this.props.ipHash;
  }

  get userAgentHash(): string | undefined {
    return this.props.userAgentHash;
  }
  /* */

  isRevoked(): boolean {
    return !!this.props.revokedAt;
  }

  static start(params: {
    userId: UserId;
    familyId: RefreshTokenFamilyId;
    ipHash?: string;
    userAgentHash?: string;
    id?: UniqueEntityId;
  }): RefreshSession {
    const session = new RefreshSession(
      {
        userId: params.userId,
        familyId: params.familyId,
        createdAt: new Date(),
        ipHash: params.ipHash,
        userAgentHash: params.userAgentHash,
      },
      params.id,
    );

    return session;
  }

  /**
   * Révoque la session (et, par convention métier, on révoquera toute la famille via application layer).
   * Idempotent : ne réémet pas d'event si déjà révoquée.
   */
  revoke(): void {
    if (this.props.revokedAt) return;

    this.props.revokedAt = new Date();
    this.addDomainEvent(new RefreshSessionRevokedEvent(this.userId, this.familyId));
  }

  /**
   * Prépare une rotation :
   * - si révoquée -> erreur métier
   * - sinon -> retourne une nouvelle RefreshSession (même familyId)
   *
   * Note : application layer gère la persistance + invalidation de l'ancien token hash.
   */
  rotate(newSessionId?: UniqueEntityId): RefreshSession {
    if (this.isRevoked()) {
      throw new RefreshSessionRevokedError();
    }

    const next = RefreshSession.start({
      userId: this.userId,
      familyId: this.familyId,
      ipHash: this.props.ipHash,
      userAgentHash: this.props.userAgentHash,
      id: newSessionId,
    });

    this.addDomainEvent(new RefreshSessionRotatedEvent(this.userId, this.familyId, next.sessionId));

    return next;
  }

  /*
   * Optionnel mais utile: reconstruction depuis DB.
   * IMPORTANT: ne push pas d'events.
   */
  static rehydrate(params: {
    id: string;
    userId: string;
    familyId: string;
    createdAt: Date;
    revokedAt?: Date | null;
    ipHash?: string | null;
    userAgentHash?: string | null;
  }): RefreshSession {
    return new RefreshSession(
      {
        userId: new UserId(params.userId),
        familyId: RefreshTokenFamilyId.create(params.familyId),
        createdAt: params.createdAt,
        revokedAt: params.revokedAt ?? undefined,
        ipHash: params.ipHash ?? undefined,
        userAgentHash: params.userAgentHash ?? undefined,
      },
      new UniqueEntityId(params.id),
    );
  }
}
