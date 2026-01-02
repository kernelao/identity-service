import { ValueObject } from '@/domain/shared/base/ValueObject';
import { InvalidTokenFamilyIdError } from '@/domain/authn/sessions/errors/InvalidTokenFamilyIdError';

type FamilyIdProps = { value: string };

/**
 * RefreshTokenFamilyId (VO)
 * -------------------------
 * Représente une "famille" de refresh tokens.
 * Lors d'une rotation, on reste dans la même famille.
 *
 * En cas de token reuse détecté : on révoque la famille complète.
 */
export class RefreshTokenFamilyId extends ValueObject<FamilyIdProps> {
  private constructor(props: FamilyIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(raw: string): RefreshTokenFamilyId {
    const value = (raw ?? '').trim();
    if (value.length === 0) throw new InvalidTokenFamilyIdError();
    return new RefreshTokenFamilyId({ value });
  }
}
