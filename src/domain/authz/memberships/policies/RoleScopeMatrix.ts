import { Role } from '@/domain/authz/memberships/value-objects/Role';
import { Scope } from '@/domain/authz/memberships/value-objects/Scope';

/**
 * RoleScopeMatrix
 * ---------------
 * Source de vérité des scopes autorisés par rôle.
 *
 * But :
 * - éviter des scopes incohérents (ex: CUSTOMER avec catalog:write)
 * - garder une règle exécutable et testable
 *
 * !!! V1 : on choisit une matrice simple.
 * Plus tard : custom per store / per user via policies.
 */
export const ROLE_SCOPES: Record<Role, Scope[]> = {
  PLATFORM_ADMIN: ['catalog:read', 'catalog:write', 'order:read', 'order:write', 'user:read'],
  STORE_ADMIN: ['catalog:read', 'catalog:write', 'order:read', 'order:write', 'user:read'],
  CUSTOMER: ['order:read'],
};

export function isScopeAllowedForRoles(scope: Scope, roles: Role[]): boolean {
  return roles.some((r) => ROLE_SCOPES[r].includes(scope));
}
