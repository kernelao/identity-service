import { RefreshTokenFamilyId } from '@/domain/authn/sessions/value-objects/RefreshTokenFamilyId';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

/**
 * RefreshSessionLookupPort
 * ------------------------
 * Permet de retrouver une session à partir du hash du refresh token.
 *
 * Le but : ne JAMAIS stocker le refresh token en clair.
 */
export type RefreshSessionRecord = {
  userId: UserId;
  familyId: RefreshTokenFamilyId;

  // pour reuse detection
  consumedAt?: Date;

  revokedAt?: Date;
};

export interface RefreshSessionLookupPort {
  findByTokenHash(tokenHash: string): Promise<RefreshSessionRecord | null>;
}
