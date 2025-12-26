import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AppRequest } from '@/interfaces/http/context/AppRequest';
import type { RequestContext } from '@/application/shared/RequestContext';
import type { JwtVerifierPort, JwtAccessClaims } from '../jwt/JwtVerifier.port';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject('JwtVerifierPort') private readonly verifier: JwtVerifierPort) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AppRequest>();

    const authHeader = req.header('authorization');
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
    };

    return true;
  }

  private extractBearerToken(header: string | undefined): string | null {
    const value = (header ?? '').trim();
    if (!value.toLowerCase().startsWith('bearer ')) return null;
    const token = value.slice(7).trim();
    return token.length ? token : null;
  }

  private extractRoles(claims: JwtAccessClaims): string[] {
    return claims.stores.flatMap((s) => s.roles);
  }

  private extractScopes(claims: JwtAccessClaims): string[] {
    return claims.stores.flatMap((s) => s.scopes);
  }
}
