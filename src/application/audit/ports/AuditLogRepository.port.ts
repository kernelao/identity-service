import { AuditLog } from '@/domain/audit/aggregates/AuditLog';

export interface AuditLogRepositoryPort {
  append(entry: AuditLog): Promise<void>;
}
