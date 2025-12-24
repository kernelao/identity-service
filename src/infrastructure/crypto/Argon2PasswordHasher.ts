import argon2 from 'argon2';
import { PasswordHasherPort } from '@/application/user/ports/PasswordHasher.port';
import { PasswordVerifierPort } from '@/application/auth/ports/PasswordVerifier.port';
import { PasswordHash } from '@/domain/credential/PasswordHash';

export class Argon2PasswordHasher implements PasswordHasherPort, PasswordVerifierPort {
  async hash(raw: string): Promise<string> {
    return argon2.hash(raw, {
      type: argon2.argon2id,
      timeCost: 3,
      memoryCost: 19456, // ~19MB
      parallelism: 1,
    });
  }

  async verify(params: { raw: string; hash: PasswordHash }): Promise<boolean> {
    return argon2.verify(params.hash.value, params.raw);
  }
}
