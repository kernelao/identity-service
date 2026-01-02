import { Membership } from '@/domain/authz/memberships/aggregates/Membership';
import { StoreId } from '@/domain/authz/memberships/value-objects/StoreId';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

export interface MembershipAdminRepositoryPort {
  /**
   * Upsert store-scoped : (userId, storeId) unique en DB.
   * Si existe -> updateAccess ; sinon -> create.
   */
  findByUserAndStore(params: { userId: UserId; storeId: StoreId }): Promise<Membership | null>;

  save(membership: Membership): Promise<{ membershipId: string }>;

  listByStore(params: { storeId: StoreId; limit: number; cursor?: string }): Promise<{
    items: Array<{ membership: Membership; membershipId: string }>;
    nextCursor?: string;
  }>;
}
