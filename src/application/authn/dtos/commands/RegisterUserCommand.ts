/**
 * RegisterUserCommand
 * -------------------
 * DTO d'entrée application (venant du controller).
 * Pas d'entités domain ici.
 */
export type RegisterUserCommand = {
  email: string;
  password: string;

  // Optionnel : si tu veux lier directement à un store lors du register
  // (sinon le membership sera géré par un use case séparé).
  storeId?: string;

  // Idempotency key (souvent header "Idempotency-Key")
  idempotencyKey: string;
};
