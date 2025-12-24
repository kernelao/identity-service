export interface IdempotencyService {
  run<T>(params: { key: string; ttlSeconds: number; handler: () => Promise<T> }): Promise<T>;
}
