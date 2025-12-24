import type { Request } from 'express';
import type { RequestContext } from '@/application/shared/RequestContext';

/**
 * AppRequest
 * ----------
 * Typage local du Request HTTP pour ce service.
 * Évite les soucis d'augmentation globale de types (tsconfig "types"/"typeRoots").
 */
export type AppRequest = Request & {
  requestContext?: RequestContext;
};
