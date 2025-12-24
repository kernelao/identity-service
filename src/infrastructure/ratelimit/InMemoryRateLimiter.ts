import { Injectable } from '@nestjs/common';

import { RateLimiterPort } from '@/application/shared/ports/RateLimiter.port';

type Bucket = { count: number; resetAtMs: number };

@Injectable()
export class InMemoryRateLimiter implements RateLimiterPort {
  private readonly buckets = new Map<string, Bucket>();

  consume(params: { key: string; limit: number; windowSeconds: number }): Promise<boolean> {
    const now = Date.now();
    const resetAtMs = now + params.windowSeconds * 1000;

    const existing = this.buckets.get(params.key);
    if (!existing || existing.resetAtMs <= now) {
      this.buckets.set(params.key, { count: 1, resetAtMs });
      return Promise.resolve(true);
    }

    if (existing.count >= params.limit) {
      return Promise.resolve(false);
    }

    existing.count += 1;
    return Promise.resolve(true);
  }
}
