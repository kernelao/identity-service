import { randomUUID } from 'node:crypto';
import { IdGeneratorPort } from '@/application/authn/usecases/Login.usecase';

export class UuidGenerator implements IdGeneratorPort {
  uuid(): string {
    return randomUUID();
  }
}
