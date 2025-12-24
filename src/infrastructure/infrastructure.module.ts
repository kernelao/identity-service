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
import { JoseTokenSigner } from '@/infrastructure/jwt/JoseTokenSigner';

@Module({
  providers: [
    PrismaService,

    // Repos
    { provide: 'UserRepositoryPort', useClass: UserPrismaRepository },
    { provide: 'CredentialRepositoryPort', useClass: CredentialPrismaRepository },
    { provide: 'MembershipRepositoryPort', useClass: MembershipPrismaRepository },
    { provide: 'MembershipAdminRepositoryPort', useClass: MembershipPrismaRepository },
    { provide: 'RefreshSessionLookupPort', useClass: RefreshSessionPrismaRepository },
    { provide: 'RefreshSessionRotationPort', useClass: RefreshSessionPrismaRepository },
    { provide: 'AuditLogRepositoryPort', useClass: AuditLogPrismaRepository },

    // Crypto
    { provide: 'PasswordHasherPort', useClass: Argon2PasswordHasher },
    { provide: 'PasswordVerifierPort', useClass: Argon2PasswordHasher },

    {
      provide: 'RefreshTokenCrypto',
      useFactory: () => new RefreshTokenCrypto(process.env.REFRESH_TOKEN_PEPPER ?? 'dev-pepper'),
    },
    { provide: 'RefreshTokenGeneratorPort', useExisting: 'RefreshTokenCrypto' },
    { provide: 'RefreshTokenHasherPort', useExisting: 'RefreshTokenCrypto' },

    { provide: 'IdGeneratorPort', useClass: UuidGenerator },

    {
      provide: 'TokenSignerPort',
      useFactory: () => new JoseTokenSigner(process.env.JWT_ACCESS_SECRET ?? 'dev-secret'),
    },
  ],
  exports: [],
})
export class InfrastructureModule {}
