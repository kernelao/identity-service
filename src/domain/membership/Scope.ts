/**
 * Scope
 * -----
 * Permissions fines (scopes) utilisées dans les JWT claims.
 * V1 : petite liste stable, extensible.
 */
export type Scope = 'catalog:read' | 'catalog:write' | 'order:read' | 'order:write' | 'user:read';
