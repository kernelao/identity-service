import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { RequestContext } from '@/application/shared/RequestContext';
import type { AppRequest } from '@/interfaces/http/context/AppRequest';

/**
 * AuthGuard (V1)
 * --------------
 * Guard minimal pour routes protégées.
 *
 * Maintenant: refuse si guest.
 * Prochaine étape: valider JWT + injecter ctx.userId/roles/scopes/storeId depuis claims.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AppRequest>();
    const ctx = req.requestContext as RequestContext;

    if (!ctx || ctx.isGuest) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
