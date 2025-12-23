/**
 * IdempotencyStorePort
 * --------------------
 * Stockage d'idempotency keys pour endpoints critiques (register, reset password confirm, etc.).
 *
 * Implémentation infra typique :
 * - Redis (recommandé)
 * - ou Postgres (table idempotency)
 *
 * Le store doit permettre:
 * - set-if-not-exists (atomique)
 * - read du résultat existant
 */
export type IdempotencyRecord<T> = {
  key: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
  // Résultat serialisable (ex: userId, tokens, etc.)
  result?: T;
};

export interface IdempotencyStorePort {
  /**
   * Essaie de "prendre" la clé. Si déjà prise, retourne l'enregistrement existant.
   * Doit être atomique côté infra.
   */
  tryAcquire<T>(params: { key: string; ttlSeconds: number }): Promise<IdempotencyRecord<T> | null>;

  /**
   * Marque la clé comme complétée et stocke un résultat (serialisable).
   */
  complete<T>(params: { key: string; result: T; ttlSeconds: number }): Promise<void>;

  /**
   * Récupère l'enregistrement si présent.
   */
  get<T>(key: string): Promise<IdempotencyRecord<T> | null>;
}
