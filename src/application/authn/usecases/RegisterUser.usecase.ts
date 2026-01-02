import { IdempotencyService } from '@/application/shared/Idempotency';
import { RequestContext } from '@/application/shared/RequestContext';
import { ConflictError } from '@/application/shared/AppError';

import { Credential } from '@/domain/authn/account/entities/Credential';
import { PasswordHash } from '@/domain/authn/credentials/value-objects/PasswordHash';
import { PasswordPolicy } from '@/domain/authn/credentials/policies/PasswordPolicy';

import { Email } from '@/domain/authn/account/value-objects/Email';
import { User } from '@/domain/authn/account/aggregates/User';
import { UserId } from '@/domain/authn/account/value-objects/UserId';

import { RegisterUserCommand } from '@/application/authn/dtos/commands/RegisterUserCommand';
import { RegisterUserResult } from '@/application/authn/dtos/results/RegisterUserResult';
import { UserRepositoryPort } from '@/application/authn/ports/repositories/UserRepository.port';
import { CredentialRepositoryPort } from '@/application/authn/ports/repositories/CredentialRepository.port';
import { PasswordHasherPort } from '@/application/authn/ports/crypto/PasswordHasher.port';

import { AuditWriter } from '@/application/audit/services/AuditWriter';

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
    private readonly idempotency: IdempotencyService,
    private readonly auditWriter: AuditWriter,
  ) {}

  async execute(ctx: RequestContext, cmd: RegisterUserCommand): Promise<RegisterUserResult> {
    // register est un endpoint public -> guest autorisé
    // mais on exige un correlationId pour observabilité

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
        await this.auditWriter.writeFromCtx(ctx, {
          actorId: userId,
          action: 'USER_REGISTERED',
        });

        return { userId: userId.value };
      },
    });
  }
}
