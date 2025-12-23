import { RateLimitService } from '@/application/shared/RateLimit';
import { RequestContext } from '@/application/shared/RequestContext';
import { UnauthorizedError } from '@/application/shared/AppError';

import { AuditLog } from '@/domain/audit/AuditLog';
import { CorrelationId } from '@/domain/audit/CorrelationId';

import { Email } from '@/domain/user/Email';
import { UserId } from '@/domain/user/UserId';

import { RefreshSession } from '@/domain/token/RefreshSession';
import { RefreshTokenFamilyId } from '@/domain/token/RefreshTokenFamilyId';

import { LoginCommand } from '@/application/auth/dtos/LoginCommand';
import { LoginResult } from '@/application/auth/dtos/LoginResult';
import { TokenAssembler } from '@/application/auth/TokenAssembler';

import { TokenSignerPort } from '@/application/auth/ports/TokenSigner.port';
import { RefreshTokenGeneratorPort } from '@/application/auth/ports/RefreshTokenGenerator.port';
import { RefreshTokenHasherPort } from '@/application/auth/ports/RefreshTokenHasher.port';
import { RefreshSessionRepositoryPort } from '@/application/auth/ports/RefreshSessionRepository.port';
import { MembershipRepositoryPort } from '@/application/auth/ports/MembershipRepository.port';
import { PasswordVerifierPort } from '@/application/auth/ports/PasswordVerifier.port';

import { UserRepositoryPort } from '@/application/user/ports/UserRepository.port';
import { CredentialRepositoryPort } from '@/application/user/ports/CredentialRepository.port';
import { AuditLogRepositoryPort } from '@/application/user/ports/AuditLogRepository.port';

/**
 * IdGeneratorPort
 * ---------------
 * Port local (application) pour générer des IDs (jti, familyId).
 * Implémentation infra: randomUUID() / uuidv4 / etc.
 */
export interface IdGeneratorPort {
  uuid(): string;
}

/**
 * LoginUseCase
 * ------------
 * Orchestration "zero-trust" :
 * - rate limiting logique
 * - vérif user + actif
 * - vérif password (via PasswordVerifierPort)
 * - construit claims multi-store (memberships)
 * - signe access token (JWT)
 * - génère refresh token opaque + stocke hash + refresh session
 * - audit log (sans PII)
 *
 * Sécurité:
 * - En cas d'échec, toujours Unauthorized (message générique) pour éviter l'énumération.
 */
export class LoginUseCase {
  private readonly accessTokenTtlSeconds = 60 * 15; // MVP: 15 min

  constructor(
    private readonly users: UserRepositoryPort,
    private readonly credentials: CredentialRepositoryPort,
    private readonly memberships: MembershipRepositoryPort,
    private readonly passwordVerifier: PasswordVerifierPort,
    private readonly tokenSigner: TokenSignerPort,
    private readonly refreshTokenGen: RefreshTokenGeneratorPort,
    private readonly refreshTokenHasher: RefreshTokenHasherPort,
    private readonly refreshSessions: RefreshSessionRepositoryPort,
    private readonly rateLimit: RateLimitService,
    private readonly audit: AuditLogRepositoryPort,
    private readonly ids: IdGeneratorPort,
  ) {}

  async execute(ctx: RequestContext, cmd: LoginCommand): Promise<LoginResult> {
    // login est public -> guest autorisé
    const correlationId = CorrelationId.create(ctx.correlationId);

    // Rate limit MVP par IP hash (on évite email en clair).
    const ipKey = ctx.ipHash ?? 'unknown';
    await this.rateLimit.enforce({
      key: `login:ip:${ipKey}`,
      limit: 10,
      windowSeconds: 60,
    });

    const email = Email.create(cmd.email);

    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    user.ensureActive();
    const userId = new UserId(user.id.value);

    const credential = await this.credentials.findPasswordCredentialByUserId(userId);
    if (!credential) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const ok = await this.passwordVerifier.verify({
      raw: cmd.password,
      hash: credential.passwordHash,
    });

    if (!ok) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // memberships (multi-store claims)
    const mbs = await this.memberships.listByUserId(userId);

    const nowSec = Math.floor(Date.now() / 1000);
    const jti = this.ids.uuid();

    const claims = TokenAssembler.buildClaims({
      userId,
      memberships: mbs,
      nowEpochSeconds: nowSec,
      expiresInSeconds: this.accessTokenTtlSeconds,
      jti,
    });

    const accessToken = await this.tokenSigner.signAccessToken({
      claims,
      expiresInSeconds: this.accessTokenTtlSeconds,
    });

    // Refresh token opaque + hash + session
    const refreshToken = await this.refreshTokenGen.generate();
    const tokenHash = await this.refreshTokenHasher.hash(refreshToken);

    const familyId = RefreshTokenFamilyId.create(this.ids.uuid());

    const session = RefreshSession.start({
      userId,
      familyId,
      ipHash: ctx.ipHash,
      userAgentHash: ctx.userAgentHash,
    });

    await this.refreshSessions.create({ session, tokenHash });

    await this.audit.append(
      AuditLog.record({
        actorId: userId,
        action: 'USER_LOGIN',
        correlationId,
        ipHash: ctx.ipHash,
        userAgentHash: ctx.userAgentHash,
      }),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenTtlSeconds,
    };
  }
}
