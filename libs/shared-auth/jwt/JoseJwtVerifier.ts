import { importSPKI, jwtVerify } from 'jose';
import type { JwtAccessClaims, JwtVerifierPort } from './JwtVerifier.port';
import { AuthError } from './AuthError';

function getJoseCode(e: unknown): string | null {
  if (typeof e !== 'object' || e === null) return null;
  if (!('code' in e)) return null;
  const code = (e as { code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

export class JoseJwtVerifier implements JwtVerifierPort {
  private publicKey?: CryptoKey;

  constructor(private readonly publicKeyPem: string) {}

  private async getKey(): Promise<CryptoKey> {
    if (!this.publicKey) {
      this.publicKey = await importSPKI(this.publicKeyPem, 'RS256');
    }
    return this.publicKey;
  }

  async verifyAccessToken(params: { token: string }): Promise<JwtAccessClaims> {
    try {
      const key = await this.getKey();

      const { payload } = await jwtVerify(params.token, key, {
        algorithms: ['RS256'],
      });

      return payload as unknown as JwtAccessClaims;
    } catch (e: unknown) {
      const code = getJoseCode(e);

      // jose expired
      if (code === 'ERR_JWT_EXPIRED') {
        throw new AuthError('TOKEN_EXPIRED', 'Invalid or expired token', e);
      }

      // jose invalid signature / malformed token / etc.
      if (
        code === 'ERR_JWT_INVALID' ||
        code === 'ERR_JWS_INVALID' ||
        code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED' ||
        code === 'ERR_JWK_INVALID'
      ) {
        throw new AuthError('TOKEN_INVALID', 'Invalid or expired token', e);
      }

      // fallback: problème interne (clé, algo, etc.)
      throw e;
    }
  }
}
