import { IdempotencyService } from '@/application/shared/Idempotency';
import { RequestContext } from '@/application/shared/RequestContext';
import { ConflictError } from '@/application/shared/AppError';

import { AuditLog } from '@/domain/audit/AuditLog';
import { CorrelationId } from '@/domain/audit/CorrelationId';

import { Credential } from '@/domain/credential/Credential';
import { PasswordHash } from '@/domain/credential/PasswordHash';
import { PasswordPolicy } from '@/domain/credential/PasswordPolicy';

import { Email } from '@/domain/user/Email';
import { User } from '@/domain/user/User';
import { UserId } from '@/domain/user/UserId';

import { RegisterUserCommand } from '@/application/user/dtos/RegisterUserCommand';
import { RegisterUserResult } from '@/application/user/dtos/RegisterUserResult';
import { UserRepositoryPort } from '@/application/user/ports/UserRepository.port';
import { CredentialRepositoryPort } from '@/application/user/ports/CredentialRepository.port';
import { PasswordHasherPort } from '@/application/user/ports/PasswordHasher.port';
import { AuditLogRepositoryPort } from '@/application/user/ports/AuditLogRepository.port';

/**
 * RegisterUserUseCase
 * -------------------
 * Orchestrateur applicatif pour créer un compte.
 *
 * Règles V1 :
 * - valide Email (domain)
 * - valide PasswordPolicy (domain)
 * - hash password (infra via port)
 * - crée User + Credential (domain)
 * - idempotent via idempotencyKey
 * - audit (sans PII)
 */
export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly credentials: CredentialRepositoryPort,
    private readonly hasher: PasswordHasherPort,
    private readonly audit: AuditLogRepositoryPort,
    private readonly idempotency: IdempotencyService,
  ) {}

  async execute(ctx: RequestContext, cmd: RegisterUserCommand): Promise<RegisterUserResult> {
    // register est un endpoint public -> guest autorisé
    // mais on exige un correlationId pour observabilité
    const correlationId = CorrelationId.create(ctx.correlationId);

    return this.idempotency.run<RegisterUserResult>({
      key: `register:${cmd.idempotencyKey}`,
      ttlSeconds: 60 * 10,
      handler: async () => {
        const email = Email.create(cmd.email);

        const existing = await this.users.findByEmail(email);
        if (existing) {
          // On renvoie un conflit plutôt que de "révéler" quoi que ce soit de sensible.
          throw new ConflictError('User already exists');
        }

        // Validation métier du mot de passe brut
        PasswordPolicy.validate(cmd.password);

        // Hash côté infra
        const hash = await this.hasher.hash(cmd.password);
        const passwordHash = PasswordHash.fromHash(hash);

        // Création domain
        const user = User.register(email);
        const userId = new UserId(user.id.value);

        const credential = Credential.createPasswordCredential({
          userId,
          passwordHash,
        });

        // Persistance
        await this.users.save(user);
        await this.credentials.save(credential);

        // Audit (sans email en clair)
        await this.audit.append(
          AuditLog.record({
            actorId: userId,
            action: 'USER_REGISTERED',
            correlationId,
            ipHash: ctx.ipHash,
            userAgentHash: ctx.userAgentHash,
          }),
        );

        return { userId: userId.value };
      },
    });
  }
}
