import { AggregateRoot } from '@/domain/shared/AggregateRoot';
import { UniqueEntityId } from '@/domain/shared/UniqueEntityId';
import { Email } from '@/domain/user/Email';
import { UserId } from '@/domain/user/UserId';
import { UserDisabledError } from '@/domain/user/errors/UserDisabledError';
import { UserDisabledEvent } from '@/domain/user/events/UserDisabledEvent';
import { UserRegisteredEvent } from '@/domain/user/events/UserRegisteredEvent';

type UserProps = {
  email: Email;
  isActive: boolean;
  createdAt: Date;
};

/**
 * User (Aggregate Root)
 * --------------------
 * Responsabilité : représenter l'identité persistée d'une personne.
 *
 * Important (multi-tenant):
 * - Le User ne porte PAS storeId
 * - Le lien user ↔ store est dans Membership (autre sous-domain)
 *
 * Invariants V1 :
 * - email validé via Email VO
 * - un user désactivé ne peut pas être utilisé pour login
 */
export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get userId(): UserId {
    return new UserId(this.id.value);
  }

  get email(): Email {
    return this.props.email;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /* ajout-
   * Alias pratique pour infra/DTOs si tu veux mapper un "status".
   * (Optionnel) — on peut aussi ne pas l'utiliser et stocker isActive en DB.
   */
  get status(): 'ACTIVE' | 'DISABLED' {
    return this.props.isActive ? 'ACTIVE' : 'DISABLED';
  }

  /**
   * Factory de création (register)
   * - émet l'event UserRegisteredEvent
   */
  static register(email: Email, id?: UniqueEntityId): User {
    const user = new User(
      {
        email,
        isActive: true,
        createdAt: new Date(),
      },
      id,
    );

    user.addDomainEvent(new UserRegisteredEvent(user.userId));
    return user;
  }

  /**
   * Assure que le user est actif (utile pour login/use cases).
   */
  ensureActive(): void {
    if (!this.props.isActive) {
      throw new UserDisabledError();
    }
  }

  /**
   * Désactive le user (action admin / sécurité).
   * - idempotent (si déjà désactivé, ne réémet pas d’event)
   */
  disable(): void {
    if (!this.props.isActive) return;

    this.props.isActive = false;
    this.addDomainEvent(new UserDisabledEvent(this.userId));
  }

  /*
   * Rehydrate: reconstruction depuis la DB.
   * IMPORTANT: ne réémet AUCUN event.
   */
  static rehydrate(params: { id: string; email: string; status: string; createdAt: Date }): User {
    return new User(
      {
        email: Email.create(params.email),
        isActive: params.status === 'ACTIVE',
        createdAt: params.createdAt,
      },
      new UniqueEntityId(params.id),
    );
  }
}
