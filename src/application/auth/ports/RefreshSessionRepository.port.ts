import { RefreshSession } from '@/domain/token/RefreshSession';
import { RefreshTokenFamilyId } from '@/domain/token/RefreshTokenFamilyId';
import { UserId } from '@/domain/user/UserId';

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
