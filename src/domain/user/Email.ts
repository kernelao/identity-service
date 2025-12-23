import { ValueObject } from '@/domain/shared/ValueObject';
import { InvalidEmailError } from '@/domain/user/errors/InvalidEmailError';

type EmailProps = {
  value: string;
};

/**
 * Email (Value Object)
 * --------------------
 * - Immuable
 * - Normalisé (lowercase, trim)
 * - Validé côté domain
 *
 * ⚠️ Note : on reste volontairement simple en V1.
 * On peut renforcer la regex plus tard sans casser le reste.
 */
export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();

    // Validation V1 volontairement simple et robuste
    const isValid =
      normalized.length <= 320 &&
      normalized.includes('@') &&
      !normalized.startsWith('@') &&
      !normalized.endsWith('@');

    if (!isValid) {
      throw new InvalidEmailError();
    }

    return new Email({ value: normalized });
  }
}
