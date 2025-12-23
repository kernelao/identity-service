/**
 * RequestContext
 * --------------
 * Contexte minimal propagé par le Gateway (zero-trust) vers chaque service.
 *
 * - Supporte guest ET authentifié
 * - Sert à l'audit (correlationId / requestId)
 * - Permet l'ABAC/RBAC en application layer
 */
export type RequestContext = {
  requestId: string;
  correlationId: string;

  // Résolu par le Gateway via Host -> storeId (peut être requis même pour guest)
  storeId?: string;

  // Présent seulement si authentifié
  userId?: string;

  // Présent seulement si authentifié
  roles?: string[];
  scopes?: string[];

  // True si aucun JWT Identity (guest)
  isGuest: boolean;

  // Identité technique (non-PII) optionnelle
  ipHash?: string;
  userAgentHash?: string;
};
