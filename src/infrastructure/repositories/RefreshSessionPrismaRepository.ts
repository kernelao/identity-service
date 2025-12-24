import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/infrastructure/db/PrismaService';
import { RefreshSessionLookupPort } from '@/application/auth/ports/RefreshSessionLookup.port';
import { RefreshSessionRotationPort } from '@/application/auth/ports/RefreshSessionRotation.port';
import { RefreshSession } from '@/domain/token/RefreshSession';
import { RefreshTokenFamilyId } from '@/domain/token/RefreshTokenFamilyId';
import { UserId } from '@/domain/user/UserId';

@Injectable()
export class RefreshSessionPrismaRepository
  implements RefreshSessionLookupPort, RefreshSessionRotationPort
{
  constructor(private readonly prisma: PrismaService) {}

  async findByTokenHash(tokenHash: string) {
    const row = await this.prisma.refreshSession.findUnique({ where: { tokenHash } });
    if (!row) return null;

    return {
      userId: new UserId(row.userId),
      familyId: RefreshTokenFamilyId.create(row.familyId),
      consumedAt: row.consumedAt ?? undefined,
      revokedAt: row.revokedAt ?? undefined,
    };
  }

  async create(params: { session: RefreshSession; tokenHash: string }): Promise<void> {
    await this.prisma.refreshSession.create({
      data: {
        id: params.session.id.value,
        userId: params.session.userId.value,
        familyId: params.session.familyId.value,
        tokenHash: params.tokenHash,
        ipHash: params.session.ipHash,
        userAgentHash: params.session.userAgentHash,
      },
    });
  }

  async rotate(params: {
    userId: UserId;
    familyId: RefreshTokenFamilyId;
    oldTokenHash: string;
    newSession: RefreshSession;
    newTokenHash: string;
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1) consume old (only if not consumed/revoked)
      const updated = await tx.refreshSession.updateMany({
        where: {
          tokenHash: params.oldTokenHash,
          revokedAt: null,
          consumedAt: null,
        },
        data: { consumedAt: new Date() },
      });

      if (updated.count !== 1) {
        // token déjà consommé => reuse detection sera gérée au niveau use case
        // Ici on laisse l'UC gérer le cas via lookup/consumedAt.
      }

      // 2) create new session
      await tx.refreshSession.create({
        data: {
          id: params.newSession.id.value,
          userId: params.userId.value,
          familyId: params.familyId.value,
          tokenHash: params.newTokenHash,
          ipHash: params.newSession.ipHash,
          userAgentHash: params.newSession.userAgentHash,
        },
      });
    });
  }

  async revokeFamily(params: { userId: UserId; familyId: RefreshTokenFamilyId }): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: { userId: params.userId.value, familyId: params.familyId.value, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
