import { ValueObject } from '@/domain/shared/base/ValueObject';
import { InvalidPasswordHashError } from '@/domain/authn/credentials/errors/InvalidPasswordHashError';

type PasswordHashProps = {
  value: string;
};

/**
 * PasswordHash (Value Object)
 * ---------------------------
 * Représente un hash de mot de passe, jamais le mot de passe brut.
 *
 * !!! Le domain ne sait pas "hasher" (infra), mais il peut :
 * - exiger qu'on ne stocke que des hashes
 * - valider un format minimal
 */
export class PasswordHash extends ValueObject<PasswordHashProps> {
  private constructor(props: PasswordHashProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static fromHash(hash: string): PasswordHash {
    const value = (hash ?? '').trim();

    // V1: on attend Argon2id côté infra.
    if (!value.startsWith('$argon2')) {
      throw new InvalidPasswordHashError('Le hash doit être au format Argon2');
    }

    return new PasswordHash({ value });
  }
}
