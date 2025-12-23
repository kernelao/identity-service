import { AuditLog } from '@/domain/audit/AuditLog';

export interface AuditLogRepositoryPort {
  append(entry: AuditLog): Promise<void>;
}
