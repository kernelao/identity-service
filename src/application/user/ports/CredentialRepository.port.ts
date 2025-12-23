import { Credential } from '@/domain/credential/Credential';
import { UserId } from '@/domain/user/UserId';

export interface CredentialRepositoryPort {
  findPasswordCredentialByUserId(userId: UserId): Promise<Credential | null>;
  save(credential: Credential): Promise<void>;
}
