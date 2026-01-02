import { Membership } from '@/domain/authz/memberships/aggregates/Membership';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

/**
 * MembershipRepositoryPort
 * ------------------------
 * Permet de construire les claims multi-store au login.
 */
export interface MembershipRepositoryPort {
  listByUserId(userId: UserId): Promise<Membership[]>;
}
