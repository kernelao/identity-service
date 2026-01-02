import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/infrastructure/db/PrismaService';
import { CredentialRepositoryPort } from '@/application/authn/ports/repositories/CredentialRepository.port';
import { Credential } from '@/domain/authn/account/entities/Credential';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

@Injectable()
export class CredentialPrismaRepository implements CredentialRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findPasswordCredentialByUserId(userId: UserId): Promise<Credential | null> {
    const row = await this.prisma.credential.findUnique({
      where: { userId_provider: { userId: userId.value, provider: 'password' } },
    });
    if (!row) return null;

    return Credential.rehydratePassword({
      id: row.id,
      userId: row.userId,
      passwordHash: row.passwordHash,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async save(credential: Credential): Promise<void> {
    await this.prisma.credential.upsert({
      where: {
        userId_provider: { userId: credential.userId.value, provider: credential.provider },
      },
      update: {
        passwordHash: credential.passwordHash.value,
      },
      create: {
        id: credential.id.value,
        userId: credential.userId.value,
        provider: credential.provider,
        passwordHash: credential.passwordHash.value,
      },
    });
  }
}
