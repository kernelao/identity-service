import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { PrismaService } from '@/infrastructure/db/PrismaService';
import { IdempotencyService } from '@/application/shared/Idempotency';

@Injectable()
export class PrismaIdempotencyService implements IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(params: { key: string; ttlSeconds: number; handler: () => Promise<T> }): Promise<T> {
    const existing = await this.prisma.idempotencyKey.findUnique({
      where: { key: params.key },
    });

    if (existing) {
      return existing.response as T;
    }

    const value = await params.handler();

    await this.prisma.idempotencyKey.create({
      data: {
        key: params.key,
        // Prisma Json: si value === null -> JsonNull
        response: value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue),
      },
    });

    return value;
  }
}
