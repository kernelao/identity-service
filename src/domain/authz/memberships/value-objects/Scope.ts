/**
 * Scope
 * -----
 * Permissions fines (scopes) utilisées dans les JWT claims.
 * V1 : petite liste stable, extensible.
 */
export type Scope = 'catalog:read' | 'catalog:write' | 'order:read' | 'order:write' | 'user:read';

/* ****** ajout (ou modif) */
const ALL_SCOPES: Scope[] = [
  'catalog:read',
  'catalog:write',
  'order:read',
  'order:write',
  'user:read',
];

export function isScope(value: string): value is Scope {
  return (ALL_SCOPES as string[]).includes(value);
}

export function parseScopes(values: string[]): Scope[] {
  for (const v of values) {
    if (!isScope(v)) {
      throw new Error(`Invalid scope: ${v}`);
    }
  }
  return values as Scope[];
}
/* FIN MODIF ***** */
