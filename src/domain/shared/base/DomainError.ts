/**
 * DomainError
 * -----------
 * Erreur métier du domain.
 *
 * Règles :
 * - Pas de HTTP status ici
 * - Pas de framework
 * - Traduit plus tard (application / interface)
 *
 * Exemple :
 * - USER_DISABLED
 * - INVALID_PASSWORD
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  protected constructor(message?: string) {
    super(message);
  }
}
