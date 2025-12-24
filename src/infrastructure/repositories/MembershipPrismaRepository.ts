import { PrismaService } from '@/infrastructure/db/PrismaService';
import { MembershipRepositoryPort } from '@/application/auth/ports/MembershipRepository.port';
import { MembershipAdminRepositoryPort } from '@/application/membership/ports/MembershipAdminRepository.port';
import { Membership } from '@/domain/membership/Membership';
import { StoreId } from '@/domain/membership/StoreId';
import { UserId } from '@/domain/user/UserId';

import { parseRoles } from '@/domain/membership/Role';
import { parseScopes } from '@/domain/membership/Scope';

export class MembershipPrismaRepository
  implements MembershipRepositoryPort, MembershipAdminRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async listByUserId(userId: UserId): Promise<Membership[]> {
    const rows = await this.prisma.membership.findMany({ where: { userId: userId.value } });
    return rows.map((r) =>
      Membership.rehydrate({
        id: r.id,
        userId: r.userId,
        storeId: r.storeId,
        roles: parseRoles(r.roles),
        scopes: parseScopes(r.scopes),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }),
    );
  }

  async findByUserAndStore(params: {
    userId: UserId;
    storeId: StoreId;
  }): Promise<Membership | null> {
    const row = await this.prisma.membership.findUnique({
      where: { userId_storeId: { userId: params.userId.value, storeId: params.storeId.value } },
    });
    if (!row) return null;

    return Membership.rehydrate({
      id: row.id,
      userId: row.userId,
      storeId: row.storeId,
      roles: parseRoles(row.roles),
      scopes: parseScopes(row.scopes),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async save(membership: Membership): Promise<{ membershipId: string }> {
    const row = await this.prisma.membership.upsert({
      where: {
        userId_storeId: { userId: membership.userId.value, storeId: membership.storeId.value },
      },
      update: { roles: membership.roles, scopes: membership.scopes },
      create: {
        id: membership.id.value,
        userId: membership.userId.value,
        storeId: membership.storeId.value,
        roles: membership.roles,
        scopes: membership.scopes,
      },
      select: { id: true },
    });

    return { membershipId: row.id };
  }

  async listByStore(params: { storeId: StoreId; limit: number; cursor?: string }) {
    const rows = await this.prisma.membership.findMany({
      where: { storeId: params.storeId.value }, // 🔥 anti cross-store
      take: params.limit,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      orderBy: { id: 'asc' },
    });

    const items = rows.map((r) => ({
      membershipId: r.id,
      membership: Membership.rehydrate({
        id: r.id,
        userId: r.userId,
        storeId: r.storeId,
        roles: parseRoles(r.roles),
        scopes: parseScopes(r.scopes),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }),
    }));

    const nextCursor = rows.length === params.limit ? rows[rows.length - 1].id : undefined;
    return { items, nextCursor };
  }
}
