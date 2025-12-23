import { ConflictError } from '@/application/shared/AppError';
import { IdempotencyStorePort } from '@/application/shared/ports/IdempotencyStore.port';

/**
 * IdempotencyService
 * ------------------
 * Pattern pour sécuriser les endpoints "at-least-once" (register, reset confirm, etc.).
 *
 * Stratégie V1:
 * - Si la clé existe et COMPLETED -> renvoyer le résultat déjà calculé
 * - Si la clé existe et IN_PROGRESS -> Conflict (ou retry côté client)
 * - Sinon -> exécuter, puis store le résultat
 */
export class IdempotencyService {
  constructor(private readonly store: IdempotencyStorePort) {}

  async run<T>(params: { key: string; ttlSeconds: number; handler: () => Promise<T> }): Promise<T> {
    const existing = await this.store.tryAcquire<T>({
      key: params.key,
      ttlSeconds: params.ttlSeconds,
    });

    if (existing) {
      if (existing.status === 'COMPLETED' && existing.result !== undefined) {
        return existing.result;
      }

      throw new ConflictError('Request already in progress');
    }

    const result = await params.handler();

    await this.store.complete<T>({
      key: params.key,
      result,
      ttlSeconds: params.ttlSeconds,
    });

    return result;
  }
}
