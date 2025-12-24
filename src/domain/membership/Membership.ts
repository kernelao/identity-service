import { Entity } from '@/domain/shared/Entity';
import { UniqueEntityId } from '@/domain/shared/UniqueEntityId';
import { UserId } from '@/domain/user/UserId';
import { StoreId } from '@/domain/membership/StoreId';
import { Role } from '@/domain/membership/Role';
import { Scope } from '@/domain/membership/Scope';
import { RoleRequiredError } from '@/domain/membership/errors/RoleRequiredError';
import { InvalidScopeError } from '@/domain/membership/errors/InvalidScopeError';
import { isScopeAllowedForRoles } from '@/domain/membership/RoleScopeMatrix';
import { MembershipGrantedEvent } from '@/domain/membership/events/MembershipGrantedEvent';

type MembershipProps = {
  userId: UserId;
  storeId: StoreId;
  roles: Role[];
  scopes: Scope[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Membership (Entity)
 * -------------------
 * Lien store-scoped (multi-tenant) entre un User et un Store.
 *
 * Golden Rule :
 * - Toute donnée store-scoped porte storeId -> ici, c’est le cas.
 *
 * Invariants V1 :
 * - userId + storeId identifient le membership (unicité assurée en DB plus tard)
 * - au moins 1 rôle
 * - scopes compatibles avec les rôles (ROLE_SCOPES)
 */
export class Membership extends Entity<MembershipProps> {
  private domainEvents: MembershipGrantedEvent[] = [];

  private constructor(props: MembershipProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get storeId(): StoreId {
    return this.props.storeId;
  }

  get roles(): Role[] {
    return [...this.props.roles];
  }

  get scopes(): Scope[] {
    return [...this.props.scopes];
  }

  pullDomainEvents(): MembershipGrantedEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  static grant(params: {
    userId: UserId;
    storeId: StoreId;
    roles: Role[];
    scopes: Scope[];
    id?: UniqueEntityId;
  }): Membership {
    if (!params.roles || params.roles.length === 0) {
      throw new RoleRequiredError();
    }

    for (const scope of params.scopes) {
      if (!isScopeAllowedForRoles(scope, params.roles)) {
        throw new InvalidScopeError(`Scope '${scope}' non autorisé pour ces rôles`);
      }
    }

    const now = new Date();
    const membership = new Membership(
      {
        userId: params.userId,
        storeId: params.storeId,
        roles: [...params.roles],
        scopes: [...params.scopes],
        createdAt: now,
        updatedAt: now,
      },
      params.id,
    );

    membership.domainEvents.push(
      new MembershipGrantedEvent(
        membership.userId,
        membership.storeId,
        membership.roles,
        membership.scopes,
      ),
    );

    return membership;
  }

  /**
   * Met à jour rôles/scopes.
   * - idempotent si rien ne change
   * - revalide les invariants
   */
  updateAccess(roles: Role[], scopes: Scope[]): void {
    if (!roles || roles.length === 0) throw new RoleRequiredError();

    for (const scope of scopes) {
      if (!isScopeAllowedForRoles(scope, roles)) {
        throw new InvalidScopeError(`Scope '${scope}' non autorisé pour ces rôles`);
      }
    }

    const sameRoles = JSON.stringify(this.props.roles) === JSON.stringify(roles);
    const sameScopes = JSON.stringify(this.props.scopes) === JSON.stringify(scopes);

    if (sameRoles && sameScopes) return;

    this.props.roles = [...roles];
    this.props.scopes = [...scopes];
    this.props.updatedAt = new Date();

    this.domainEvents.push(
      new MembershipGrantedEvent(this.userId, this.storeId, this.roles, this.scopes),
    );
  }

  /*
   * Rehydrate: reconstruction DB.
   * IMPORTANT: ne push PAS d'events.
   */
  static rehydrate(params: {
    id: string;
    userId: string;
    storeId: string;
    roles: Role[];
    scopes: Scope[];
    createdAt: Date;
    updatedAt: Date;
  }): Membership {
    return new Membership(
      {
        userId: new UserId(params.userId),
        storeId: StoreId.create(params.storeId),
        roles: [...params.roles],
        scopes: [...params.scopes],
        createdAt: params.createdAt,
        updatedAt: params.updatedAt,
      },
      new UniqueEntityId(params.id),
    );
  }
}
