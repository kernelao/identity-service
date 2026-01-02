import { Email } from '@/domain/authn/account/value-objects/Email';
import { User } from '@/domain/authn/account/aggregates/User';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

export interface UserRepositoryPort {
  findByEmail(email: Email): Promise<User | null>;
  findById(userId: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}
