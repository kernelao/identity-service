import { TooManyRequestsError } from '@/application/shared/AppError';
import { RateLimiterPort } from '@/application/shared/ports/RateLimiter.port';

/**
 * RateLimitService
 * ----------------
 * Encapsule la logique de rate limiting côté application.
 *
 * Exemples d'usage :
 * - Login: key = "login:ip:<ipHash>"
 * - Forgot password: key = "pwd:forgot:ip:<ipHash>"
 */
export class RateLimitService {
  constructor(private readonly limiter: RateLimiterPort) {}

  async enforce(params: { key: string; limit: number; windowSeconds: number }): Promise<void> {
    const allowed = await this.limiter.consume(params);

    if (!allowed) {
      throw new TooManyRequestsError('Rate limit exceeded');
    }
  }
}
