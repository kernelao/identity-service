import { SignJWT, importPKCS8 } from 'jose';
import { TokenSignerPort } from '@/application/auth/ports/TokenSigner.port';
import { JwtClaims } from '@/application/auth/JwtClaims';

export class JoseTokenSigner implements TokenSignerPort {
  constructor(private readonly privateKeyPem: string) {}

  async signAccessToken(params: { claims: JwtClaims; expiresInSeconds: number }): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    // RS256 => clé PRIVÉE (PKCS8 PEM) importée en KeyLike
    const key = await importPKCS8(this.privateKeyPem, 'RS256');

    return new SignJWT(params.claims)
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(now + params.expiresInSeconds)
      .sign(key);
  }
}
