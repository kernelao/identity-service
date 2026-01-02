import { RequestContext } from '@/application/shared/RequestContext';
import { UnauthorizedError } from '@/application/shared/AppError';

import { UserId } from '@/domain/authn/account/value-objects/UserId';

import { UserRepositoryPort } from '@/application/authn/ports/repositories/UserRepository.port';
import { MembershipRepositoryPort } from '@/application/authn/ports/repositories/MembershipRepository.port';
import { GetMeResult } from '@/application/authn/dtos/results/GetMeResult';

/**
 * GetMeUseCase
 * ------------
 * Retourne l'identité du user connecté + ses memberships multi-store.
 *
 * Sécurité:
 * - refuse si guest
 * - ne retourne que les données nécessaires (pas de PII supplémentaire)
 */
export class GetMeUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly memberships: MembershipRepositoryPort,
  ) {}

  async execute(ctx: RequestContext): Promise<GetMeResult> {
    if (ctx.isGuest || !ctx.userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const userId = new UserId(ctx.userId);

    const user = await this.users.findById(userId);
    if (!user) {
      // Token valide mais user supprimé/désync -> on force une ré-auth côté client
      throw new UnauthorizedError('Unauthorized');
    }

    user.ensureActive();

    const mbs = await this.memberships.listByUserId(userId);

    return {
      userId: userId.value,
      email: user.email.value,
      memberships: mbs.map((m) => ({
        storeId: m.storeId.value,
        roles: m.roles,
        scopes: m.scopes,
      })),
    };
  }
}
