import { importSPKI, jwtVerify } from 'jose';
import type { JwtAccessClaims, JwtVerifierPort } from './JwtVerifier.port';

/**
 * JoseJwtVerifier (RS256)
 * ----------------------
 * Vérifie signature/exp via PUBLIC KEY (SPKI PEM).
 */
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
    const key = await this.getKey();

    const { payload } = await jwtVerify(params.token, key, {
      algorithms: ['RS256'],
    });

    // payload est typé "JWTPayload" => on cast vers notre shape contrôlée
    return payload as unknown as JwtAccessClaims;
  }
}
