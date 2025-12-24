import { Entity } from '@/domain/shared/Entity';
import { UniqueEntityId } from '@/domain/shared/UniqueEntityId';
import { UserId } from '@/domain/user/UserId';
import { CredentialProvider } from '@/domain/credential/CredentialProvider';
import { PasswordHash } from '@/domain/credential/PasswordHash';

type CredentialProps = {
  userId: UserId;
  provider: CredentialProvider;
  passwordHash: PasswordHash;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Credential (Entity)
 * -------------------
 * Représente une "preuve d'identité" liée à un user.
 *
 * - Séparé de User pour éviter de mélanger identité et sécurité
 * - Extensible à d'autres providers (OAuth future)
 *
 * Invariants V1 :
 * - provider = 'password'
 * - stocke uniquement passwordHash (jamais le brut)
 */
export class Credential extends Entity<CredentialProps> {
  private constructor(props: CredentialProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get provider(): CredentialProvider {
    return this.props.provider;
  }

  get passwordHash(): PasswordHash {
    return this.props.passwordHash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static createPasswordCredential(params: {
    userId: UserId;
    passwordHash: PasswordHash;
  }): Credential {
    const now = new Date();

    return new Credential({
      userId: params.userId,
      provider: 'password',
      passwordHash: params.passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Change le hash (ex: reset password).
   * Le domain impose une transition explicite (audit-friendly).
   */
  changePasswordHash(newHash: PasswordHash): void {
    this.props.passwordHash = newHash;
    this.props.updatedAt = new Date();
  }

  /*
   * Rehydrate: reconstruction DB.
   * IMPORTANT: pas d'events.
   */
  static rehydratePassword(params: {
    id: string;
    userId: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
  }): Credential {
    return new Credential(
      {
        userId: new UserId(params.userId),
        provider: 'password',
        passwordHash: PasswordHash.fromHash(params.passwordHash),
        createdAt: params.createdAt,
        updatedAt: params.updatedAt,
      },
      new UniqueEntityId(params.id),
    );
  }
}
