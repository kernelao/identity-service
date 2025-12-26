import { JoseJwtVerifier } from '../jwt/JoseJwtVerifier';
import { readPemFromEnvOrFile } from '../jwt/pem';

export function createJwtVerifierProvider() {
  return {
    provide: 'JwtVerifierPort',
    useFactory: () => {
      const publicPem = readPemFromEnvOrFile(
        'JWT_ACCESS_PUBLIC_KEY_PATH',
        'JWT_ACCESS_PUBLIC_KEY_PEM',
      );

      if (!publicPem) {
        throw new Error(
          'Missing JWT public key. Provide JWT_ACCESS_PUBLIC_KEY_PATH or JWT_ACCESS_PUBLIC_KEY_PEM',
        );
      }

      return new JoseJwtVerifier(publicPem);
    },
  };
}