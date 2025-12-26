export type AuthErrorCode = 'TOKEN_INVALID' | 'TOKEN_EXPIRED';

export class AuthError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
