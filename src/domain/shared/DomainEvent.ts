/**
 * DomainEvent
 * -----------
 * Représente un fait métier qui s’est produit dans le domain.
 *
 * - Émis par un Aggregate Root
 * - Ne contient QUE des données métier
 * - Aucun transport (Kafka, HTTP, etc.) ici
 *
 * L’infrastructure décidera comment le publier (outbox, bus, etc.).
 */
export interface DomainEvent {
  readonly occurredAt: Date;
}
