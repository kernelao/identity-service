import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';

/* =========================
 * USE CASES
 * ========================= */
import { LoginUseCase } from '@/application/authn/usecases/Login.usecase';
import { RefreshTokenUseCase } from '@/application/authn/usecases/RefreshToken.usecase';
import { LogoutUseCase } from '@/application/authn/usecases/Logout.usecase';
import { GrantMembershipUseCase } from '@/application/authz/usecases/GrantMembership.usecase';
import { RegisterUserUseCase } from '@/application/authn/usecases/RegisterUser.usecase';
import { GetMeUseCase } from '@/application/authn/usecases/GetMe.usecase';
import { ListMembershipsUseCase } from '@/application/authz/usecases/ListMembership.usecase';

/* =========================
 * PORTS (types only)
 * ========================= */
import { UserRepositoryPort } from '@/application/authn/ports/repositories/UserRepository.port';
import { CredentialRepositoryPort } from '@/application/authn/ports/repositories/CredentialRepository.port';
import { MembershipRepositoryPort } from '@/application/authn/ports/repositories/MembershipRepository.port';
import { RefreshSessionRepositoryPort } from '@/application/authn/ports/repositories/RefreshSessionRepository.port';

import { PasswordVerifierPort } from '@/application/authn/ports/crypto/PasswordVerifier.port';
import { PasswordHasherPort } from '@/application/authn/ports/crypto/PasswordHasher.port';
import { RefreshTokenGeneratorPort } from '@/application/authn/ports/crypto/RefreshTokenGenerator.port';
import { RefreshTokenHasherPort } from '@/application/authn/ports/crypto/RefreshTokenHasher.port';

import { TokenSignerPort } from '@/application/authn/ports/jwt/TokenSigner.port';

import { RefreshSessionLookupPort } from '@/application/authn/ports/RefreshSessionLookup.port';
import { RefreshSessionRotationPort } from '@/application/authn/ports/RefreshSessionRotation.port';

import { MembershipAdminRepositoryPort } from '@/application/authz/ports/MembershipAdminRepository.port';

import { AuditLogRepositoryPort } from '@/application/audit/ports/AuditLogRepository.port';

/* =========================
 * AUDIT
 * ========================= */
import { AuditWriter } from '@/application/audit/services/AuditWriter';
import { AUDIT_WRITER } from '@/application/audit/services/audit.token';

/* =========================
 * SHARED
 * ========================= */
import { RateLimitService } from '@/application/shared/RateLimit';
import { IdGeneratorPort } from '@/application/authn/usecases/Login.usecase';
import { IdempotencyService } from '@/application/shared/Idempotency';

@Module({
  imports: [InfrastructureModule],

  providers: [
    /**
     * AuditWriter: utilisé seulement par les usecases déjà refactor (Login/Register).
     * Il dépend du AuditLogRepositoryPort (impl fourni par InfrastructureModule).
     */
    {
      provide: AUDIT_WRITER,
      useFactory: (repo: AuditLogRepositoryPort) => new AuditWriter(repo),
      inject: ['AuditLogRepositoryPort'],
    },

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
        ids: IdGeneratorPort,
        auditWriter: AuditWriter,
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
          ids,
          auditWriter,
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
        'IdGeneratorPort',
        AUDIT_WRITER,
      ],
    },

    /**
     * RefreshTokenUseCase: on garde l'ancien wiring (audit repo direct)
     * tant que tu n'as pas refactor ce usecase vers AuditWriter.
     */
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

    /**
     * LogoutUseCase: idem, audit repo direct (ancien état)
     */
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
        idempotency: IdempotencyService,
        auditWriter: AuditWriter,
      ) => new RegisterUserUseCase(users, credentials, hasher, idempotency, auditWriter),
      inject: [
        'UserRepositoryPort',
        'CredentialRepositoryPort',
        'PasswordHasherPort',
        'IdempotencyService',
        AUDIT_WRITER,
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
    AUDIT_WRITER,
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
