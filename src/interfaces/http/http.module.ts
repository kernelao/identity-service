import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { RequestContextMiddleware } from '@/interfaces/http/context/RequestContext.middleware';
import { AuthController } from '@/interfaces/http/auth/Auth.controller';
import { UsersController } from '@/interfaces/http/users/Users.controller';
import { MembershipsController } from '@/interfaces/http/memberships/Memberships.controller';

@Module({
  controllers: [AuthController, UsersController, MembershipsController],
  providers: [],
  exports: [],
})
export class HttpModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
