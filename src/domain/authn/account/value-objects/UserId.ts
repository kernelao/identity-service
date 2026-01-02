import { UniqueEntityId } from '@/domain/shared/base/UniqueEntityId';

/**
 * UserId
 * ------
 * Type dédié pour éviter de mélanger des IDs (userId vs storeId vs orderId).
 * Sert aussi à rendre le code plus explicite et plus sûr.
 */
export class UserId extends UniqueEntityId {}
