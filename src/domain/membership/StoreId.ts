import { ValueObject } from '@/domain/shared/ValueObject';
import { InvalidStoreIdError } from '@/domain/membership/errors/InvalidStoreIdError';

type StoreIdProps = { value: string };

/**
 * StoreId (Value Object)
 * ----------------------
 * Représente un tenant (Store) côté domain.
 * On garde un format simple en V1 : string non vide, trim.
 */
export class StoreId extends ValueObject<StoreIdProps> {
  private constructor(props: StoreIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(raw: string): StoreId {
    const value = (raw ?? '').trim();
    if (value.length === 0) throw new InvalidStoreIdError();
    return new StoreId({ value });
  }
}
