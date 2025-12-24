import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApplicationModule } from '@/application/application.module';

import { RequestContextMiddleware } from '@/interfaces/http/context/RequestContext.middleware';
import { AuthController } from '@/interfaces/http/auth/Auth.controller';
import { UsersController } from '@/interfaces/http/users/Users.controller';
import { MembershipsController } from '@/interfaces/http/memberships/Memberships.controller';
import { HealthController } from '@/interfaces/http/health/Health.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [HealthController, AuthController, UsersController, MembershipsController],
})
export class HttpModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
