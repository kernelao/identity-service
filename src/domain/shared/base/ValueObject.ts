/**
 * ValueObject
 * -----------
 * Base class pour tous les Value Objects du domain.
 *
 * Règles :
 * - Immuable
 * - Comparable par valeur
 * - Pas d’identité propre
 *
 * Exemples :
 * - Email
 * - PasswordHash
 * - Role
 */
export abstract class ValueObject<T> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }

  equals(vo?: ValueObject<T>): boolean {
    if (!vo) return false;
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}
