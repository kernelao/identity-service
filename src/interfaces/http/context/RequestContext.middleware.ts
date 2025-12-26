import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Response, NextFunction } from 'express';
import { RequestContext } from '@/application/shared/RequestContext';
import type { AppRequest } from '@/interfaces/http/context/AppRequest';

/**
 * RequestContextMiddleware
 * ------------------------
 * Construit un RequestContext minimal pour tous les endpoints.
 *
 * IMPORTANT (zero-trust):
 * - Pour l’instant on détecte guest vs auth via presence du header Authorization.
 * - La validation JWT et l’extraction claims se feront via AuthGuard (prochaine étape infra).
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: AppRequest, _res: Response, next: NextFunction): void {
    const requestId = (req.header('x-request-id') ?? req.header('x-requestid') ?? '').trim();
    const correlationId = (
      req.header('x-correlation-id') ??
      req.header('x-correlationid') ??
      ''
    ).trim();
    const storeId = (req.header('x-store-id') ?? '').trim();

    const ctx: RequestContext = {
      requestId: requestId || 'missing',
      correlationId: correlationId || 'missing',
      storeId: storeId || undefined,
      isGuest: true, // par défaut Guest, tant que AuthGuard na pas validé un JWT
      ipHash: (req.header('x-ip-hash') ?? '').trim() || undefined,
      userAgentHash: (req.header('x-ua-hash') ?? '').trim() || undefined,
    };

    req.requestContext = ctx;
    next();
  }
}
