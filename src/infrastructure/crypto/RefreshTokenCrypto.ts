import { createHash, randomBytes } from 'node:crypto';
import { RefreshTokenGeneratorPort } from '@/application/auth/ports/RefreshTokenGenerator.port';
import { RefreshTokenHasherPort } from '@/application/auth/ports/RefreshTokenHasher.port';

export class RefreshTokenCrypto implements RefreshTokenGeneratorPort, RefreshTokenHasherPort {
  constructor(private readonly pepper: string) {}

  generate(): Promise<string> {
    const token = randomBytes(48).toString('base64url');
    return Promise.resolve(token);
  }

  hash(token: string): Promise<string> {
    const hashed = createHash('sha256').update(`${this.pepper}:${token}`).digest('hex');
    return Promise.resolve(hashed);
  }
}
