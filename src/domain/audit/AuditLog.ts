import { Entity } from '@/domain/shared/Entity';
import { UniqueEntityId } from '@/domain/shared/UniqueEntityId';
import { CorrelationId } from '@/domain/audit/CorrelationId';
import { AuditAction } from '@/domain/audit/AuditAction';
import { AuditTargetType } from '@/domain/audit/AuditTargetType';
import { UserId } from '@/domain/user/UserId';
import { StoreId } from '@/domain/membership/StoreId';

type AuditLogProps = {
  actorId: UserId;
  action: AuditAction;

  // storeId seulement si l'action est store-scoped (ex: membership grant)
  storeId?: StoreId;

  // cible optionnelle (ex: target userId, membership id)
  targetType?: AuditTargetType;
  targetId?: string;

  correlationId: CorrelationId;
  createdAt: Date;

  // Métadonnées non sensibles (hash uniquement) — optionnel en V1
  ipHash?: string;
  userAgentHash?: string;
};

/**
 * AuditLog (Entity)
 * -----------------
 * Trace une action importante/sensible.
 *
 * Règles de sécurité :
 * - pas de PII en clair (email, IP brute, etc.)
 * - corrélable via correlationId
 *
 * Note : ce modèle est "global" : storeId est optionnel
 * car certaines actions sont platform-wide (ex: login).
 */
export class AuditLog extends Entity<AuditLogProps> {
  private constructor(props: AuditLogProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get actorId(): UserId {
    return this.props.actorId;
  }

  get action(): AuditAction {
    return this.props.action;
  }

  get storeId(): StoreId | undefined {
    return this.props.storeId;
  }

  get targetType(): AuditTargetType | undefined {
    return this.props.targetType;
  }

  get targetId(): string | undefined {
    return this.props.targetId;
  }

  get correlationId(): CorrelationId {
    return this.props.correlationId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  static record(params: {
    actorId: UserId;
    action: AuditAction;
    correlationId: CorrelationId;
    storeId?: StoreId;
    targetType?: AuditTargetType;
    targetId?: string;
    ipHash?: string;
    userAgentHash?: string;
    id?: UniqueEntityId;
  }): AuditLog {
    return new AuditLog(
      {
        actorId: params.actorId,
        action: params.action,
        storeId: params.storeId,
        targetType: params.targetType,
        targetId: params.targetId,
        correlationId: params.correlationId,
        createdAt: new Date(),
        ipHash: params.ipHash,
        userAgentHash: params.userAgentHash,
      },
      params.id,
    );
  }
}
