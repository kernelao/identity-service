import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import type { AppRequest } from '@/interfaces/http/context/AppRequest';
import type { RequestContext } from '@/application/shared/RequestContext';
import type { JwtVerifierPort, JwtAccessClaims } from '@/application/shared/ports/JwtVerifier.port';

/**
 * JwtAuthGuard
 * ------------
 * Guard HTTP responsable de :
 * - extraire le Bearer token
 * - vérifier signature + exp via JwtVerifierPort
 * - enrichir le RequestContext (userId / roles / scopes / stores)
 *
 * Zero-trust:
 * - aucune logique crypto ici
 * - aucune dépendance directe à jose
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject('JwtVerifierPort') private readonly verifier: JwtVerifierPort) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AppRequest>();

    const authHeader = req.header('authorization');
    if (!authHeader) throw new UnauthorizedException();

    const token = this.extractBearerToken(authHeader);
    if (!token) throw new UnauthorizedException();

    const claims = await this.verifier.verifyAccessToken({ token });
    if (!claims?.sub) throw new UnauthorizedException();

    const ctx: RequestContext = req.requestContext ?? {
      requestId: 'missing',
      correlationId: 'missing',
      isGuest: false,
    };

    req.requestContext = {
      ...ctx,
      isGuest: false,
      userId: claims.sub,
      roles: this.extractRoles(claims),
      scopes: this.extractScopes(claims),
      // storeId: ctx.storeId ?? undefined, // à améliorer : (gateway vs claims)
    };

    return true;
  }

  private extractBearerToken(header: string): string | null {
    const value = header.trim();
    if (!value.toLowerCase().startsWith('bearer ')) return null;
    const token = value.slice(7).trim();
    return token.length > 0 ? token : null;
  }

  private extractRoles(claims: JwtAccessClaims): string[] {
    return claims.stores.flatMap((s) => s.roles);
  }

  private extractScopes(claims: JwtAccessClaims): string[] {
    return claims.stores.flatMap((s) => s.scopes);
  }
}
