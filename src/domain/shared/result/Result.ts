/**
 * Result
 * ------
 * Wrapper fonctionnel pour gérer succès / erreur sans throw immédiat.
 *
 * Très utile dans :
 * - application layer
 * - use cases
 *
 * !!! Optionnel dans le domain, mais autorisé.
 */
export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly value?: T,
    public readonly error?: Error,
  ) {}

  static ok<T>(value: T): Result<T> {
    return new Result<T>(true, value);
  }

  static fail<T>(error: Error): Result<T> {
    return new Result<T>(false, undefined, error);
  }

  getOrThrow(): T {
    if (!this.isSuccess) {
      // ESLint exige qu’une instance d’Error soit garantie lors du lancement (throw).
      throw this.error ?? new Error('Result failure');
    }

    // Sans risque : isSuccess = true garantit la présence de la valeur par construction.
    return this.value as T;
  }
}
