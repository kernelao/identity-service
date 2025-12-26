import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';

/* =========================
 * USE CASES
 * ========================= */
import { LoginUseCase } from '@/application/auth/Login.usecase';
import { RefreshTokenUseCase } from '@/application/auth/RefreshToken.usecase';
import { LogoutUseCase } from '@/application/auth/Logout.usecase';
import { GrantMembershipUseCase } from '@/application/membership/GrantMembership.usecase';
import { RegisterUserUseCase } from '@/application/user/RegisterUser.usecase';
import { GetMeUseCase } from '@/application/user/GetMe.usecase';
import { ListMembershipsUseCase } from '@/application/membership/ListMembership.usecase';

/* =========================
 * PORTS
 * ========================= */
import { UserRepositoryPort } from '@/application/user/ports/UserRepository.port';
import { CredentialRepositoryPort } from '@/application/user/ports/CredentialRepository.port';
import { PasswordVerifierPort } from '@/application/auth/ports/PasswordVerifier.port';
import { PasswordHasherPort } from '@/application/user/ports/PasswordHasher.port';
import { AuditLogRepositoryPort } from '@/application/user/ports/AuditLogRepository.port';

import { MembershipRepositoryPort } from '@/application/auth/ports/MembershipRepository.port';
import { RefreshSessionRepositoryPort } from '@/application/auth/ports/RefreshSessionRepository.port';
import { RefreshSessionLookupPort } from '@/application/auth/ports/RefreshSessionLookup.port';
import { RefreshSessionRotationPort } from '@/application/auth/ports/RefreshSessionRotation.port';
import { RefreshTokenGeneratorPort } from '@/application/auth/ports/RefreshTokenGenerator.port';
import { RefreshTokenHasherPort } from '@/application/auth/ports/RefreshTokenHasher.port';
import { TokenSignerPort } from '@/application/auth/ports/TokenSigner.port';

import { MembershipAdminRepositoryPort } from '@/application/membership/ports/MembershipAdminRepository.port';

/* =========================
 * SHARED
 * ========================= */
import { RateLimitService } from '@/application/shared/RateLimit';
import { IdGeneratorPort } from '@/application/auth/Login.usecase';
import { IdempotencyService } from '@/application/shared/Idempotency';

@Module({
  imports: [InfrastructureModule],

  providers: [
    {
      provide: LoginUseCase,
      useFactory: (
        users: UserRepositoryPort,
        credentials: CredentialRepositoryPort,
        memberships: MembershipRepositoryPort,
        passwordVerifier: PasswordVerifierPort,
        tokenSigner: TokenSignerPort,
        refreshTokenGen: RefreshTokenGeneratorPort,
        refreshTokenHasher: RefreshTokenHasherPort,
        refreshSessions: RefreshSessionRepositoryPort,
        rateLimit: RateLimitService,
        audit: AuditLogRepositoryPort,
        ids: IdGeneratorPort,
      ) =>
        new LoginUseCase(
          users,
          credentials,
          memberships,
          passwordVerifier,
          tokenSigner,
          refreshTokenGen,
          refreshTokenHasher,
          refreshSessions,
          rateLimit,
          audit,
          ids,
        ),
      inject: [
        'UserRepositoryPort',
        'CredentialRepositoryPort',
        'MembershipRepositoryPort',
        'PasswordVerifierPort',
        'TokenSignerPort',
        'RefreshTokenGeneratorPort',
        'RefreshTokenHasherPort',
        'RefreshSessionRepositoryPort',
        'RateLimitService',
        'AuditLogRepositoryPort',
        'IdGeneratorPort',
      ],
    },

    {
      provide: RefreshTokenUseCase,
      useFactory: (
        lookup: RefreshSessionLookupPort,
        rotation: RefreshSessionRotationPort,
        memberships: MembershipRepositoryPort,
        tokenSigner: TokenSignerPort,
        refreshTokenGen: RefreshTokenGeneratorPort,
        refreshTokenHasher: RefreshTokenHasherPort,
        audit: AuditLogRepositoryPort,
        ids: IdGeneratorPort,
      ) =>
        new RefreshTokenUseCase(
          lookup,
          rotation,
          memberships,
          tokenSigner,
          refreshTokenGen,
          refreshTokenHasher,
          audit,
          ids,
        ),
      inject: [
        'RefreshSessionLookupPort',
        'RefreshSessionRotationPort',
        'MembershipRepositoryPort',
        'TokenSignerPort',
        'RefreshTokenGeneratorPort',
        'RefreshTokenHasherPort',
        'AuditLogRepositoryPort',
        'IdGeneratorPort',
      ],
    },

    {
      provide: LogoutUseCase,
      useFactory: (
        hasher: RefreshTokenHasherPort,
        lookup: RefreshSessionLookupPort,
        rotation: RefreshSessionRotationPort,
        audit: AuditLogRepositoryPort,
      ) => new LogoutUseCase(hasher, lookup, rotation, audit),
      inject: [
        'RefreshTokenHasherPort',
        'RefreshSessionLookupPort',
        'RefreshSessionRotationPort',
        'AuditLogRepositoryPort',
      ],
    },

    {
      provide: GrantMembershipUseCase,
      useFactory: (
        repo: MembershipAdminRepositoryPort,
        audit: AuditLogRepositoryPort,
        idempotency: IdempotencyService,
      ) => new GrantMembershipUseCase(repo, audit, idempotency),
      inject: ['MembershipAdminRepositoryPort', 'AuditLogRepositoryPort', 'IdempotencyService'],
    },

    {
      provide: RegisterUserUseCase,
      useFactory: (
        users: UserRepositoryPort,
        credentials: CredentialRepositoryPort,
        hasher: PasswordHasherPort,
        audit: AuditLogRepositoryPort,
        idempotency: IdempotencyService,
      ) => new RegisterUserUseCase(users, credentials, hasher, audit, idempotency),
      inject: [
        'UserRepositoryPort',
        'CredentialRepositoryPort',
        'PasswordHasherPort',
        'AuditLogRepositoryPort',
        'IdempotencyService',
      ],
    },

    {
      provide: GetMeUseCase,
      useFactory: (users: UserRepositoryPort, memberships: MembershipRepositoryPort) =>
        new GetMeUseCase(users, memberships),
      inject: ['UserRepositoryPort', 'MembershipRepositoryPort'],
    },

    {
      provide: ListMembershipsUseCase,
      useFactory: (repo: MembershipAdminRepositoryPort, audit: AuditLogRepositoryPort) =>
        new ListMembershipsUseCase(repo, audit),
      inject: ['MembershipAdminRepositoryPort', 'AuditLogRepositoryPort'],
    },
  ],

  exports: [
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GrantMembershipUseCase,
    RegisterUserUseCase,
    GetMeUseCase,
    ListMembershipsUseCase,
  ],
})
export class ApplicationModule {}
