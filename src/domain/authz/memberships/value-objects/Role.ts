/**
 * Role
 * ----
 * Rôles métiers (RBAC) reconnus par Identity.
 * Guest n'est pas un rôle (guest = pas d'identité).
 */
export type Role = 'CUSTOMER' | 'STORE_ADMIN' | 'PLATFORM_ADMIN';

/* ****** ajout */
const ALL_ROLES: Role[] = ['CUSTOMER', 'STORE_ADMIN', 'PLATFORM_ADMIN'];

export function isRole(value: string): value is Role {
  return (ALL_ROLES as string[]).includes(value);
}

export function parseRoles(values: string[]): Role[] {
  for (const v of values) {
    if (!isRole(v)) throw new Error(`Invalid role: ${v}`);
  }
  return values as Role[];
}
