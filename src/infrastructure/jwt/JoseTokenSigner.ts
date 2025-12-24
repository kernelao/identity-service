import { SignJWT } from 'jose';
import { TokenSignerPort } from '@/application/auth/ports/TokenSigner.port';
import { JwtClaims } from '@/application/auth/JwtClaims';

export class JoseTokenSigner implements TokenSignerPort {
  constructor(private readonly secret: string) {}

  async signAccessToken(params: { claims: JwtClaims; expiresInSeconds: number }): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    return new SignJWT(params.claims)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(now + params.expiresInSeconds)
      .sign(new TextEncoder().encode(this.secret));
  }
}
