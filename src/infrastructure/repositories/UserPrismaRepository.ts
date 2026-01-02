import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/infrastructure/db/PrismaService';
import { UserRepositoryPort } from '@/application/authn/ports/repositories/UserRepository.port';
import { Email } from '@/domain/authn/account/value-objects/Email';
import { User } from '@/domain/authn/account/aggregates/User';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

@Injectable()
export class UserPrismaRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email: email.value } });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findById(userId: UserId): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id: userId.value } });
    if (!row) return null;
    return this.toDomain(row);
  }

  async save(user: User): Promise<void> {
    // V1 : upsert simple (le domain génère l'id)
    await this.prisma.user.upsert({
      where: { id: user.id.value },
      update: {
        email: user.email.value,
        status: user.status,
      },
      create: {
        id: user.id.value,
        email: user.email.value,
        status: user.status,
      },
    });
  }

  private toDomain(row: { id: string; email: string; status: string; createdAt: Date }): User {
    // Ici tu adaptes selon ton User domain (register/rehydrate).
    // Supposons que ton User a un constructeur/factory "rehydrate".
    return User.rehydrate({
      id: row.id,
      email: row.email,
      status: row.status,
      createdAt: row.createdAt,
    });
  }
}
