import { Module } from '@nestjs/common';

import { PrismaService } from '@/infrastructure/db/PrismaService';

import { UserPrismaRepository } from '@/infrastructure/repositories/UserPrismaRepository';
import { CredentialPrismaRepository } from '@/infrastructure/repositories/CredentialPrismaRepository';
import { MembershipPrismaRepository } from '@/infrastructure/repositories/MembershipPrismaRepository';
import { RefreshSessionPrismaRepository } from '@/infrastructure/repositories/RefreshSessionPrismaRepository';
import { AuditLogPrismaRepository } from '@/infrastructure/repositories/AuditLogPrismaRepository';

import { Argon2PasswordHasher } from '@/infrastructure/crypto/Argon2PasswordHasher';
import { RefreshTokenCrypto } from '@/infrastructure/crypto/RefreshTokenCrypto';
import { UuidGenerator } from '@/infrastructure/ids/UuidGenerator';

import { PrismaIdempotencyService } from '@/infrastructure/idempotency/PrismaIdempotencyService';

import { RateLimitService } from '@/application/shared/RateLimit';
import { InMemoryRateLimiter } from '@/infrastructure/ratelimit/InMemoryRateLimiter';
import { RateLimiterPort } from '@/application/shared/ports/RateLimiter.port';

import { JoseTokenSigner } from '@/infrastructure/jwt/JoseTokenSigner';

//import { JoseJwtVerifier } from '@/infrastructure/jwt/JoseJwtVerifier';
import { readPemFromEnvOrFile } from 'libs/shared-auth';
import { createJwtVerifierProvider } from 'libs/shared-auth';

@Module({
  providers: [
    PrismaService,

    { provide: 'UserRepositoryPort', useClass: UserPrismaRepository },
    { provide: 'CredentialRepositoryPort', useClass: CredentialPrismaRepository },
    { provide: 'MembershipRepositoryPort', useClass: MembershipPrismaRepository },
    { provide: 'MembershipAdminRepositoryPort', useClass: MembershipPrismaRepository },

    { provide: 'RefreshSessionLookupPort', useClass: RefreshSessionPrismaRepository },
    { provide: 'RefreshSessionRotationPort', useClass: RefreshSessionPrismaRepository },
    { provide: 'RefreshSessionRepositoryPort', useClass: RefreshSessionPrismaRepository },

    { provide: 'AuditLogRepositoryPort', useClass: AuditLogPrismaRepository },

    { provide: 'PasswordHasherPort', useClass: Argon2PasswordHasher },
    { provide: 'PasswordVerifierPort', useClass: Argon2PasswordHasher },

    {
      provide: 'RefreshTokenCrypto',
      useFactory: () => new RefreshTokenCrypto(process.env.REFRESH_TOKEN_PEPPER ?? 'dev-pepper'),
    },
    { provide: 'RefreshTokenGeneratorPort', useExisting: 'RefreshTokenCrypto' },
    { provide: 'RefreshTokenHasherPort', useExisting: 'RefreshTokenCrypto' },

    { provide: 'IdGeneratorPort', useClass: UuidGenerator },

    // JWT RS256 (Identity signe avec private, vérifie avec public)
    {
      provide: 'TokenSignerPort',
      useFactory: () => {
        const privatePem = readPemFromEnvOrFile(
          'JWT_ACCESS_PRIVATE_KEY_PATH',
          'JWT_ACCESS_PRIVATE_KEY_PEM',
        );
        if (!privatePem) {
          throw new Error(
            'Missing JWT private key. Provide JWT_ACCESS_PRIVATE_KEY_PATH or JWT_ACCESS_PRIVATE_KEY_PEM',
          );
        }
        return new JoseTokenSigner(privatePem);
      },
    },

    // Tous les services (y compris Identity) vérifients avec PUBLIC KEY
    createJwtVerifierProvider(),

    {
      provide: 'IdempotencyService',
      useFactory: (prisma: PrismaService) => new PrismaIdempotencyService(prisma),
      inject: [PrismaService],
    },

    { provide: 'RateLimiterPort', useClass: InMemoryRateLimiter },
    {
      provide: 'RateLimitService',
      useFactory: (limiter: RateLimiterPort) => new RateLimitService(limiter),
      inject: ['RateLimiterPort'],
    },
  ],
  exports: [
    PrismaService,
    'UserRepositoryPort',
    'CredentialRepositoryPort',
    'MembershipRepositoryPort',
    'MembershipAdminRepositoryPort',
    'RefreshSessionLookupPort',
    'RefreshSessionRotationPort',
    'RefreshSessionRepositoryPort',
    'AuditLogRepositoryPort',
    'PasswordHasherPort',
    'PasswordVerifierPort',
    'RefreshTokenGeneratorPort',
    'RefreshTokenHasherPort',
    'IdGeneratorPort',
    'TokenSignerPort',
    'JwtVerifierPort',
    'IdempotencyService',
    'RateLimitService',
  ],
})
export class InfrastructureModule {}
