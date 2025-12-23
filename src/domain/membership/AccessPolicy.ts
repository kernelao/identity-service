import { Role } from '@/domain/membership/Role';
import { StoreId } from '@/domain/membership/StoreId';

/**
 * AccessPolicy (exécutable)
 * -------------------------
 * Règles d'autorisation "métier" (pas HTTP) utilisées par l'application.
 *
 * V1 : très simple
 * - PLATFORM_ADMIN peut gérer tous les stores
 * - STORE_ADMIN ne peut gérer QUE son store
 */
export class AccessPolicy {
  static canManageStore(params: {
    actorRoles: Role[];
    actorStoreIds: string[];
    targetStoreId: StoreId;
  }): boolean {
    if (params.actorRoles.includes('PLATFORM_ADMIN')) return true;

    if (params.actorRoles.includes('STORE_ADMIN')) {
      return params.actorStoreIds.includes(params.targetStoreId.value);
    }

    return false;
  }
}
