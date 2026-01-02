import { Body, Controller, Headers, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { Ctx } from '@/interfaces/http/context/RequestContext.decorator';
import type { RequestContext } from '@/application/shared/RequestContext';

import { LoginRequest } from '@/interfaces/http/authn/dto/Login.request';
import { RefreshRequest } from '@/interfaces/http/authn/dto/Refresh.request';
import { LogoutRequest } from '@/interfaces/http/authn/dto/Logout.request';

// Use cases (tu les as déjà en application)
import { LoginUseCase } from '@/application/authn/usecases/Login.usecase';
import { RefreshTokenUseCase } from '@/application/authn/usecases/RefreshToken.usecase';
import { LogoutUseCase } from '@/application/authn/usecases/Logout.usecase';

@Controller('/v1/auth')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AuthController {
  constructor(
    private readonly login: LoginUseCase,
    private readonly refresh: RefreshTokenUseCase,
    private readonly logout: LogoutUseCase,
  ) {}

  @Post('/login')
  async loginRoute(@Ctx() ctx: RequestContext, @Body() body: LoginRequest) {
    return this.login.execute(ctx, { email: body.email, password: body.password });
  }

  @Post('/refresh')
  async refreshRoute(@Ctx() ctx: RequestContext, @Body() body: RefreshRequest) {
    return this.refresh.execute(ctx, { refreshToken: body.refreshToken });
  }

  @Post('/logout')
  async logoutRoute(@Ctx() ctx: RequestContext, @Body() body: LogoutRequest) {
    return this.logout.execute(ctx, { refreshToken: body.refreshToken });
  }
}
