import { Email } from '@/domain/user/Email';
import { User } from '@/domain/user/User';
import { UserId } from '@/domain/user/UserId';

export interface UserRepositoryPort {
  findByEmail(email: Email): Promise<User | null>;
  findById(userId: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}
