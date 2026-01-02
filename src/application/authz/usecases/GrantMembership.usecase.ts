import { RequestContext } from '@/application/shared/RequestContext';
import { ForbiddenError, UnauthorizedError } from '@/application/shared/AppError';
import { IdempotencyService } from '@/application/shared/Idempotency';

import { AuditLog } from '@/domain/audit/aggregates/AuditLog';
import { CorrelationId } from '@/domain/audit/value-objects/CorrelationId';

import { AccessPolicy } from '@/domain/authz/memberships/policies/AccessPolicy';
import { Membership } from '@/domain/authz/memberships/aggregates/Membership';
import { Role } from '@/domain/authz/memberships/value-objects/Role';
import { StoreId } from '@/domain/authz/memberships/value-objects/StoreId';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

import { AuditLogRepositoryPort } from '@/application/audit/ports/AuditLogRepository.port';
import { GrantMembershipCommand } from '@/application/authz/dtos/GrantMembershipCommand';
import { GrantMembershipResult } from '@/application/authz/dtos/GrantMembershipResult';
import { MembershipAdminRepositoryPort } from '@/application/authz/ports/MembershipAdminRepository.port';

import { parseScopes } from '@/domain/authz/memberships/value-objects/Scope';

/**
 * GrantMembershipUseCase
 * ----------------------
 * Admin: attribue (ou met à jour) un membership store-scoped.
 *
 * Sécurité:
 * - refuse guest
 * - PLATFORM_ADMIN peut gérer tous les stores
 * - STORE_ADMIN peut gérer seulement son store (ctx.storeId) via AccessPolicy
 *
 * Multi-tenant:
 * - storeId est explicite dans la commande
 * - repository doit filtrer par storeId (anti cross-store)
 *
 * Idempotency:
 * - requis (header Idempotency-Key)
 */
export class GrantMembershipUseCase {
  constructor(
    private readonly repo: MembershipAdminRepositoryPort,
    private readonly audit: AuditLogRepositoryPort,
    private readonly idempotency: IdempotencyService,
  ) {}

  async execute(ctx: RequestContext, cmd: GrantMembershipCommand): Promise<GrantMembershipResult> {
    if (ctx.isGuest || !ctx.userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const correlationId = CorrelationId.create(ctx.correlationId);

    // Autorisation (MVP): rôle-based via ctx.roles + ctx.storeId (store actif)
    const actorRoles = (ctx.roles ?? []) as Role[];
    const actorStoreIds = ctx.storeId ? [ctx.storeId] : [];

    const targetStoreId = StoreId.create(cmd.storeId);

    const allowed = AccessPolicy.canManageStore({
      actorRoles,
      actorStoreIds,
      targetStoreId,
    });

    if (!allowed) {
      throw new ForbiddenError('Forbidden');
    }

    return this.idempotency.run<GrantMembershipResult>({
      key: `grant-membership:${cmd.idempotencyKey}`,
      ttlSeconds: 60 * 10,
      handler: async () => {
        const actorId = new UserId(ctx.userId);
        const targetUserId = new UserId(cmd.userId);

        const roles = cmd.roles as Role[];
        const scopes = parseScopes(cmd.scopes);

        // Upsert
        const existing = await this.repo.findByUserAndStore({
          userId: targetUserId,
          storeId: targetStoreId,
        });

        if (!existing) {
          const membership = Membership.grant({
            userId: targetUserId,
            storeId: targetStoreId,
            roles,
            scopes,
          });

          const saved = await this.repo.save(membership);

          await this.audit.append(
            AuditLog.record({
              actorId,
              action: 'MEMBERSHIP_GRANTED',
              correlationId,
              storeId: targetStoreId,
              targetType: 'MEMBERSHIP',
              targetId: saved.membershipId,
              ipHash: ctx.ipHash,
              userAgentHash: ctx.userAgentHash,
            }),
          );

          return { membershipId: saved.membershipId };
        }

        // Mise à jour (domain revalide invariants)
        existing.updateAccess(roles, scopes);
        const saved = await this.repo.save(existing);

        await this.audit.append(
          AuditLog.record({
            actorId,
            action: 'MEMBERSHIP_GRANTED',
            correlationId,
            storeId: targetStoreId,
            targetType: 'MEMBERSHIP',
            targetId: saved.membershipId,
            ipHash: ctx.ipHash,
            userAgentHash: ctx.userAgentHash,
          }),
        );

        return { membershipId: saved.membershipId };
      },
    });
  }
}
