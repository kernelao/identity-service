import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { ApplicationModule } from '@/application/application.module';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';

import { RequestContextMiddleware } from '@/interfaces/http/context/RequestContext.middleware';

import { AuthController } from '@/interfaces/http/authn/Auth.controller';
import { UsersController } from '@/interfaces/http/authn/Users.controller';
import { MembershipsController } from '@/interfaces/http/authz/Memberships.controller';
import { HealthController } from '@/interfaces/http/health/Health.controller';

import { JwtAuthGuard } from '@/interfaces/http/guards/JwtAuth.guard';

@Module({
  // HttpModule est la “composition root” de la couche HTTP :
  // - ApplicationModule => use cases
  // - InfrastructureModule => impl des ports (JwtVerifierPort, TokenSignerPort, repos, etc.)
  imports: [ApplicationModule, InfrastructureModule],
  controllers: [HealthController, AuthController, UsersController, MembershipsController],
  providers: [JwtAuthGuard],
})
export class HttpModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
