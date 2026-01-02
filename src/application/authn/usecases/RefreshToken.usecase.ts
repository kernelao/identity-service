import { RequestContext } from '@/application/shared/RequestContext';
import { UnauthorizedError } from '@/application/shared/AppError';

import { AuditLog } from '@/domain/audit/aggregates/AuditLog';
import { CorrelationId } from '@/domain/audit/value-objects/CorrelationId';

import { RefreshSession } from '@/domain/authn/sessions/aggregates/RefreshSession';

import { RefreshTokenCommand } from '@/application/authn/dtos/commands/RefreshTokenCommand';
import { RefreshTokenResult } from '@/application/authn/dtos/results/RefreshTokenResult';
import { TokenAssembler } from '@/application/authn/services/TokenAssembler';

import { TokenSignerPort } from '@/application/authn/ports/jwt/TokenSigner.port';
import { RefreshTokenGeneratorPort } from '@/application/authn/ports/crypto/RefreshTokenGenerator.port';
import { RefreshTokenHasherPort } from '@/application/authn/ports/crypto/RefreshTokenHasher.port';
import { MembershipRepositoryPort } from '@/application/authn/ports/repositories/MembershipRepository.port';
import { RefreshSessionLookupPort } from '@/application/authn/ports/RefreshSessionLookup.port';
import { RefreshSessionRotationPort } from '@/application/authn/ports/RefreshSessionRotation.port';
import { AuditLogRepositoryPort } from '@/application/audit/ports/AuditLogRepository.port';
import { IdGeneratorPort } from '@/application/authn/usecases/Login.usecase';

/**
 * RefreshTokenUseCase
 * -------------------
 * Rotation secure des refresh tokens.
 *
 * Reuse detection:
 * - si consumedAt existe => token déjà utilisé -> vol probable -> revoke family
 */
export class RefreshTokenUseCase {
  private readonly accessTokenTtlSeconds = 60 * 15;

  constructor(
    private readonly lookup: RefreshSessionLookupPort,
    private readonly rotation: RefreshSessionRotationPort,
    private readonly memberships: MembershipRepositoryPort,
    private readonly tokenSigner: TokenSignerPort,
    private readonly refreshTokenGen: RefreshTokenGeneratorPort,
    private readonly refreshTokenHasher: RefreshTokenHasherPort,
    private readonly audit: AuditLogRepositoryPort,
    private readonly ids: IdGeneratorPort,
  ) {}

  async execute(ctx: RequestContext, cmd: RefreshTokenCommand): Promise<RefreshTokenResult> {
    const correlationId = CorrelationId.create(ctx.correlationId);

    // On hash le refresh token fourni pour lookup DB
    const oldTokenHash = await this.refreshTokenHasher.hash(cmd.refreshToken);

    const record = await this.lookup.findByTokenHash(oldTokenHash);
    if (!record) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Si déjà révoqué -> refus
    if (record.revokedAt) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Reuse detection: token déjà consommé => on révoque toute la famille
    if (record.consumedAt) {
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

      throw new UnauthorizedError('Refresh token reuse detected');
    }

    // Construire nouveaux tokens
    const userId = record.userId;
    const familyId = record.familyId;

    const newRefreshToken = await this.refreshTokenGen.generate();
    const newTokenHash = await this.refreshTokenHasher.hash(newRefreshToken);

    const newSession = RefreshSession.start({
      userId,
      familyId,
      ipHash: ctx.ipHash,
      userAgentHash: ctx.userAgentHash,
    });

    // Rotation transactionnelle (consume old + create new)
    await this.rotation.rotate({
      userId,
      familyId,
      oldTokenHash,
      newSession,
      newTokenHash,
    });

    // Re-signer access token (claims multi-store)
    const mbs = await this.memberships.listByUserId(userId);
    const nowSec = Math.floor(Date.now() / 1000);
    const jti = this.ids.uuid();

    const claims = TokenAssembler.buildClaims({
      userId,
      memberships: mbs,
      nowEpochSeconds: nowSec,
      expiresInSeconds: this.accessTokenTtlSeconds,
      jti,
    });

    const accessToken = await this.tokenSigner.signAccessToken({
      claims,
      expiresInSeconds: this.accessTokenTtlSeconds,
    });

    await this.audit.append(
      AuditLog.record({
        actorId: userId,
        action: 'REFRESH_ROTATED',
        correlationId,
        ipHash: ctx.ipHash,
        userAgentHash: ctx.userAgentHash,
      }),
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.accessTokenTtlSeconds,
    };
  }
}
