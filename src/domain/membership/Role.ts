/**
 * Role
 * ----
 * Rôles métiers (RBAC) reconnus par Identity.
 * Guest n'est pas un rôle (guest = pas d'identité).
 */
export type Role = 'PLATFORM_ADMIN' | 'STORE_ADMIN' | 'CUSTOMER';
