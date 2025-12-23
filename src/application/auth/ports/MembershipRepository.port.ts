import { Membership } from '@/domain/membership/Membership';
import { UserId } from '@/domain/user/UserId';

/**
 * MembershipRepositoryPort
 * ------------------------
 * Permet de construire les claims multi-store au login.
 */
export interface MembershipRepositoryPort {
  listByUserId(userId: UserId): Promise<Membership[]>;
}
