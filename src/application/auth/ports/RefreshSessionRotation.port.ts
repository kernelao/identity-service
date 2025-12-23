import { RefreshSession } from '@/domain/token/RefreshSession';
import { RefreshTokenFamilyId } from '@/domain/token/RefreshTokenFamilyId';
import { UserId } from '@/domain/user/UserId';

/**
 * RefreshSessionRotationPort
 * --------------------------
 * Opérations d'écriture liées à la rotation.
 * À implémenter de façon transactionnelle côté DB.
 */
export interface RefreshSessionRotationPort {
  /**
   * Marque le tokenHash courant comme consommé et crée une nouvelle session + nouveau tokenHash.
   * Doit être atomique (transaction DB).
   */
  rotate(params: {
    userId: UserId;
    familyId: RefreshTokenFamilyId;
    oldTokenHash: string;
    newSession: RefreshSession;
    newTokenHash: string;
  }): Promise<void>;

  /**
   * Révoque toute la famille (reuse detection).
   */
  revokeFamily(params: { userId: UserId; familyId: RefreshTokenFamilyId }): Promise<void>;
}
