import { Membership } from '@/domain/membership/Membership';
import { StoreId } from '@/domain/membership/StoreId';
import { UserId } from '@/domain/user/UserId';

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
