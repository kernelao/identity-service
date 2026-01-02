import { randomUUID } from 'crypto';

/**
 * UniqueEntityId
 * ----------------
 * Identifiant unique pour toutes les entités et agrégats du domain.
 *
 * - Stable dans le temps
 * - Comparable par valeur
 * - Généré côté domain (pas dépendant de la DB)
 *
 * !!! Ce n’est PAS un UUID technique (DB, JWT, etc.)
 * C’est une identité métier.
 */
export class UniqueEntityId {
  readonly value: string;

  constructor(value?: string) {
    this.value = value ?? randomUUID();
  }

  equals(id?: UniqueEntityId): boolean {
    if (!id) return false;
    return this.value === id.value;
  }

  toString(): string {
    return this.value;
  }
}
