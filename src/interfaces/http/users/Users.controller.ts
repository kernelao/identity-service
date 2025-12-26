import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Ctx } from '@/interfaces/http/context/RequestContext.decorator';
import type { RequestContext } from '@/application/shared/RequestContext';

import { RegisterUserUseCase } from '@/application/user/RegisterUser.usecase';
import { GetMeUseCase } from '@/application/user/GetMe.usecase';

import { RegisterUserRequest } from '@/interfaces/http/users/dto/RegisterUser.request';

import { JwtAuthGuard } from '@/interfaces/http/guards/JwtAuth.guard';

@Controller('/v1')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class UsersController {
  constructor(
    private readonly register: RegisterUserUseCase,
    private readonly me: GetMeUseCase,
  ) {}

  @Post('/users')
  async registerRoute(
    @Ctx() ctx: RequestContext,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: RegisterUserRequest,
  ) {
    const key = (idempotencyKey ?? '').trim();
    return this.register.execute(ctx, {
      email: body.email,
      password: body.password,
      storeId: body.storeId,
      idempotencyKey: key || 'missing',
    });
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async meRoute(@Ctx() ctx: RequestContext) {
    return this.me.execute(ctx);
  }
}
