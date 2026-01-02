import { Credential } from '@/domain/authn/account/entities/Credential';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

export interface CredentialRepositoryPort {
  findPasswordCredentialByUserId(userId: UserId): Promise<Credential | null>;
  save(credential: Credential): Promise<void>;
}
