import { importSPKI, jwtVerify } from 'jose';
import type { JwtVerifierPort, JwtAccessClaims } from '@/application/shared/ports/JwtVerifier.port';

export class JoseJwtVerifier implements JwtVerifierPort {
  private keyPromise: Promise<CryptoKey>;

  constructor(private readonly publicKeyPem: string) {
    // on prépare la clé une fois (lazy + safe)
    this.keyPromise = importSPKI(this.publicKeyPem, 'RS256');
  }

  async verifyAccessToken(params: { token: string }): Promise<JwtAccessClaims> {
    const key = await this.keyPromise;

    const { payload } = await jwtVerify(params.token, key, {
      algorithms: ['RS256'],
    });

    // payload est un JWTPayload => cast contrôlé vers le bon type
    return payload as unknown as JwtAccessClaims;
  }
}
