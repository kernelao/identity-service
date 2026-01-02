import { RefreshSession } from '@/domain/authn/sessions/aggregates/RefreshSession';
import { RefreshTokenFamilyId } from '@/domain/authn/sessions/value-objects/RefreshTokenFamilyId';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

/**
 * RefreshSessionRepositoryPort
 * ----------------------------
 * Persistance des refresh sessions (rotation/revocation).
 *
 * On stocke:
 * - session aggregate (userId, familyId, revokedAt, createdAt, metadata hash)
 * - + tokenHash (opaque token hash)
 */
export interface RefreshSessionRepositoryPort {
  create(params: { session: RefreshSession; tokenHash: string }): Promise<void>;

  revokeFamily(params: { userId: UserId; familyId: RefreshTokenFamilyId }): Promise<void>;
}
