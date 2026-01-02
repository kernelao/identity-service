import { RequestContext } from '@/application/shared/RequestContext';
import { ForbiddenError, UnauthorizedError } from '@/application/shared/AppError';

import { AccessPolicy } from '@/domain/authz/memberships/policies/AccessPolicy';
import { Role } from '@/domain/authz/memberships/value-objects/Role';
import { StoreId } from '@/domain/authz/memberships/value-objects/StoreId';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

import { AuditLog } from '@/domain/audit/aggregates/AuditLog';
import { CorrelationId } from '@/domain/audit/value-objects/CorrelationId';

import { AuditLogRepositoryPort } from '@/application/audit/ports/AuditLogRepository.port';
import { ListMembershipsQuery } from '@/application/authz/dtos/ListMembershipsQuery';
import { ListMembershipsResult } from '@/application/authz/dtos/ListMembershipsResult';
import { MembershipAdminRepositoryPort } from '@/application/authz/ports/MembershipAdminRepository.port';

/**
 * ListMembershipsUseCase
 * ----------------------
 * Admin: liste des memberships pour un store.
 *
 * Anti cross-store:
 * - query filtrée par storeId (port impose storeId)
 */
export class ListMembershipsUseCase {
  constructor(
    private readonly repo: MembershipAdminRepositoryPort,
    private readonly audit: AuditLogRepositoryPort,
  ) {}

  async execute(ctx: RequestContext, query: ListMembershipsQuery): Promise<ListMembershipsResult> {
    if (ctx.isGuest || !ctx.userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const correlationId = CorrelationId.create(ctx.correlationId);

    const actorRoles = (ctx.roles ?? []) as Role[];
    const actorStoreIds = ctx.storeId ? [ctx.storeId] : [];
    const targetStoreId = StoreId.create(query.storeId);

    const allowed = AccessPolicy.canManageStore({
      actorRoles,
      actorStoreIds,
      targetStoreId,
    });

    if (!allowed) {
      throw new ForbiddenError('Forbidden');
    }

    const limit = Math.min(Math.max(query.limit ?? 50, 1), 200);

    const res = await this.repo.listByStore({
      storeId: targetStoreId,
      limit,
      cursor: query.cursor,
    });

    // audit (sans PII)
    await this.audit.append(
      AuditLog.record({
        actorId: new UserId(ctx.userId),
        action: 'MEMBERSHIP_LISTED',
        correlationId,
        storeId: targetStoreId,
        targetType: 'MEMBERSHIP',
        targetId: undefined,
        ipHash: ctx.ipHash,
        userAgentHash: ctx.userAgentHash,
      }),
    );

    return {
      items: res.items.map((x) => ({
        membershipId: x.membershipId,
        userId: x.membership.userId.value,
        storeId: x.membership.storeId.value,
        roles: x.membership.roles,
        scopes: x.membership.scopes,
      })),
      nextCursor: res.nextCursor,
    };
  }
}
