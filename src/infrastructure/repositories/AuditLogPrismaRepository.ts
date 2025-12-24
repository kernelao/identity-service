import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/infrastructure/db/PrismaService';
import { AuditLogRepositoryPort } from '@/application/user/ports/AuditLogRepository.port';
import { AuditLog } from '@/domain/audit/AuditLog';

@Injectable()
export class AuditLogPrismaRepository implements AuditLogRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async append(entry: AuditLog): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        id: entry.id.value,
        actorId: entry.actorId.value,
        action: entry.action,
        storeId: entry.storeId?.value,
        targetType: entry.targetType,
        targetId: entry.targetId,
        correlationId: entry.correlationId.value,
        ipHash: entry.ipHash,
        userAgentHash: entry.userAgentHash,
      },
    });
  }
}
