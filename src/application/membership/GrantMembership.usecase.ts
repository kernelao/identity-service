import { RequestContext } from '@/application/shared/RequestContext';
import { ForbiddenError, UnauthorizedError } from '@/application/shared/AppError';
import { IdempotencyService } from '@/application/shared/Idempotency';

import { AuditLog } from '@/domain/audit/AuditLog';
import { CorrelationId } from '@/domain/audit/CorrelationId';

import { AccessPolicy } from '@/domain/membership/AccessPolicy';
import { Membership } from '@/domain/membership/Membership';
import { Role } from '@/domain/membership/Role';
import { Scope } from '@/domain/membership/Scope';
import { StoreId } from '@/domain/membership/StoreId';
import { UserId } from '@/domain/user/UserId';

import { AuditLogRepositoryPort } from '@/application/user/ports/AuditLogRepository.port';
import { GrantMembershipCommand } from '@/application/membership/dtos/GrantMembershipCommand';
import { GrantMembershipResult } from '@/application/membership/dtos/GrantMembershipResult';
import { MembershipAdminRepositoryPort } from '@/application/membership/ports/MembershipAdminRepository.port';

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
        const scopes = cmd.scopes as Scope[];

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
