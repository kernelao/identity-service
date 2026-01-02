import { UniqueEntityId } from '@/domain/shared/base/UniqueEntityId';

/**
 * Entity
 * ------
 * Base class pour toutes les entités du domain.
 *
 * Une Entity :
 * - possède une identité (UniqueEntityId)
 * - est mutable
 * - est comparée par identité, pas par état
 *
 * Exemples :
 * - Membership
 * - Credential
 */
export abstract class Entity<T> {
  protected readonly _id: UniqueEntityId;
  protected props: T;

  protected constructor(props: T, id?: UniqueEntityId) {
    this._id = id ?? new UniqueEntityId();
    this.props = props;
  }

  get id(): UniqueEntityId {
    return this._id;
  }

  equals(entity?: Entity<T>): boolean {
    if (!entity) return false;
    return this._id.equals(entity._id);
  }
}
