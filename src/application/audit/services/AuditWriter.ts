import { Inject, Injectable } from '@nestjs/common';

import type { RequestContext } from '@/application/shared/RequestContext';
import { AuditLog } from '@/domain/audit/aggregates/AuditLog';
import { CorrelationId } from '@/domain/audit/value-objects/CorrelationId';
import type { AuditAction } from '@/domain/audit/value-objects/AuditAction';
import type { AuditTargetType } from '@/domain/audit/value-objects/AuditTargetType';
import { StoreId } from '@/domain/authz/memberships/value-objects/StoreId';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

import type { AuditLogRepositoryPort } from '@/application/audit/ports/AuditLogRepository.port';
import { AUDIT_WRITER } from '@/application/audit/services/audit.token';

type WriteParams = {
  actorId: UserId;
  action: AuditAction;
  storeId?: string;
  targetType?: AuditTargetType;
  targetId?: string;
};

/**
 * AuditWriter
 * -----------
 * Centralise l'écriture d'audit depuis un RequestContext
 * sans manipuler de PII (ipHash / uaHash uniquement).
 */
@Injectable()
export class AuditWriter {
  constructor(
    @Inject(AUDIT_WRITER)
    private readonly repo: AuditLogRepositoryPort,
  ) {}

  async writeFromCtx(ctx: RequestContext, params: WriteParams): Promise<void> {
    const correlationId = CorrelationId.create(ctx.correlationId);

    const ipHash: string | undefined = typeof ctx.ipHash === 'string' ? ctx.ipHash : undefined;
    const userAgentHash: string | undefined =
      typeof ctx.userAgentHash === 'string' ? ctx.userAgentHash : undefined;

    const storeId = params.storeId ? StoreId.create(params.storeId) : undefined;

    const entry = AuditLog.record({
      actorId: params.actorId,
      action: params.action,
      storeId,
      targetType: params.targetType,
      targetId: params.targetId,
      correlationId,
      ipHash,
      userAgentHash,
    });

    await this.repo.append(entry);
  }
}
