import { Entity } from '@/domain/shared/base/Entity';
import { DomainEvent } from '@/domain/shared/base/DomainEvent';

/**
 * AggregateRoot
 * -------------
 * Base class pour tous les agrégats du domain.
 *
 * Responsabilités :
 * - Garantir les invariants métier
 * - Être le seul point d’entrée pour modifier l’agrégat
 * - Émettre des DomainEvents
 *
 * Exemples :
 * - User
 * - RefreshSession
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  private domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  /**
   * Récupère et vide les events émis par l’agrégat.
   * Utilisé typiquement par l’outbox pattern.
   */
  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
}
