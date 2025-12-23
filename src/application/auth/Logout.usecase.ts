import { RequestContext } from '@/application/shared/RequestContext';

import { AuditLog } from '@/domain/audit/AuditLog';
import { CorrelationId } from '@/domain/audit/CorrelationId';

import { LogoutCommand } from '@/application/auth/dtos/LogoutCommand';
import { LogoutResult } from '@/application/auth/dtos/LogoutResult';
import { RefreshTokenHasherPort } from '@/application/auth/ports/RefreshTokenHasher.port';
import { RefreshSessionLookupPort } from '@/application/auth/ports/RefreshSessionLookup.port';
import { RefreshSessionRotationPort } from '@/application/auth/ports/RefreshSessionRotation.port';
import { AuditLogRepositoryPort } from '@/application/user/ports/AuditLogRepository.port';

/**
 * LogoutUseCase
 * -------------
 * Révoque la "family" de refresh tokens associée au refreshToken présenté.
 *
 * Comportement sécurité:
 * - Si le token est invalide/inconnu, on retourne quand même success=true (idempotent, anti-enum).
 * - Pas de leak d'info.
 */
export class LogoutUseCase {
  constructor(
    private readonly hasher: RefreshTokenHasherPort,
    private readonly lookup: RefreshSessionLookupPort,
    private readonly rotation: RefreshSessionRotationPort,
    private readonly audit: AuditLogRepositoryPort,
  ) {}

  async execute(ctx: RequestContext, cmd: LogoutCommand): Promise<LogoutResult> {
    const correlationId = CorrelationId.create(ctx.correlationId);

    const tokenHash = await this.hasher.hash(cmd.refreshToken);
    const record = await this.lookup.findByTokenHash(tokenHash);

    // Idempotent: si pas trouvé -> on "réussit" quand même
    if (!record) {
      return { success: true };
    }

    await this.rotation.revokeFamily({ userId: record.userId, familyId: record.familyId });

    await this.audit.append(
      AuditLog.record({
        actorId: record.userId,
        action: 'REFRESH_REVOKED',
        correlationId,
        ipHash: ctx.ipHash,
        userAgentHash: ctx.userAgentHash,
      }),
    );

    return { success: true };
  }
}
