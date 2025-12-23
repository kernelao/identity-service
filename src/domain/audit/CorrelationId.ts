import { ValueObject } from '@/domain/shared/ValueObject';
import { InvalidCorrelationIdError } from '@/domain/audit/errors/InvalidCorrelationIdError';

type CorrelationIdProps = { value: string };

/**
 * CorrelationId (Value Object)
 * ----------------------------
 * Identifiant de corrélation (observabilité).
 *
 * V1: validation simple (non vide). On pourra exiger UUID plus tard.
 */
export class CorrelationId extends ValueObject<CorrelationIdProps> {
  private constructor(props: CorrelationIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(raw: string): CorrelationId {
    const value = (raw ?? '').trim();
    if (value.length === 0) throw new InvalidCorrelationIdError();
    return new CorrelationId({ value });
  }
}
