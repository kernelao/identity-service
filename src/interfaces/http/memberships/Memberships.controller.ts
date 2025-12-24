import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Ctx } from '@/interfaces/http/context/RequestContext.decorator';
import { AuthGuard } from '@/interfaces/http/context/Auth.guard';
import type { RequestContext } from '@/application/shared/RequestContext';

import { GrantMembershipUseCase } from '@/application/membership/GrantMembership.usecase';
import { ListMembershipsUseCase } from '@/application/membership/ListMembership.usecase';

import { GrantMembershipRequest } from '@/interfaces/http/memberships/dto/GrantMembership.request';
import { ListMembershipsQueryDto } from '@/interfaces/http/memberships/dto/ListMemberships.query';

@Controller('/v1/stores/:storeId/memberships')
@UseGuards(AuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class MembershipsController {
  constructor(
    private readonly grant: GrantMembershipUseCase,
    private readonly list: ListMembershipsUseCase,
  ) {}

  @Post()
  async grantRoute(
    @Ctx() ctx: RequestContext,
    @Param('storeId') storeId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: GrantMembershipRequest,
  ) {
    const key = (idempotencyKey ?? '').trim();

    return this.grant.execute(ctx, {
      storeId,
      userId: body.userId,
      roles: body.roles,
      scopes: body.scopes ?? [],
      idempotencyKey: key || 'missing',
    });
  }

  @Get()
  async listRoute(
    @Ctx() ctx: RequestContext,
    @Param('storeId') storeId: string,
    @Query() query: ListMembershipsQueryDto,
  ) {
    const limit = query.limit ? Number(query.limit) : undefined;

    return this.list.execute(ctx, {
      storeId,
      cursor: query.cursor,
      limit,
    });
  }
}
