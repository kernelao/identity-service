import { JwtClaims } from '@/application/auth/JwtClaims';
import { Membership } from '@/domain/membership/Membership';
import { UserId } from '@/domain/user/UserId';

/**
 * TokenAssembler
 * --------------
 * Convertit le modèle métier (UserId + Memberships) -> claims JWT.
 *
 * Important:
 * - Pas de logique de signature ici
 * - Juste de la projection propre (application boundary)
 */
export class TokenAssembler {
  static buildClaims(params: {
    userId: UserId;
    memberships: Membership[];
    nowEpochSeconds: number;
    expiresInSeconds: number;
    jti: string;
  }): JwtClaims {
    const stores = params.memberships.map((m) => ({
      storeId: m.storeId.value,
      roles: m.roles,
      scopes: m.scopes,
    }));

    return {
      sub: params.userId.value,
      stores,
      iat: params.nowEpochSeconds,
      exp: params.nowEpochSeconds + params.expiresInSeconds,
      jti: params.jti,
    };
  }
}
