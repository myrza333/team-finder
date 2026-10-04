import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { CurrentUserId } from '../common/current-user.decorator.js';
import { RateLimit } from '../common/rate-limit.js';
import { UuidParamPipe } from '../common/uuid.js';
import { DirectService } from './direct.service.js';

class SendDirectDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 2000)
  text!: string;
}

class DirectMessagesQueryDto {
  @IsOptional()
  @Matches(/^\d+$/)
  before?: string;
}

// Личные чаты с владельцем проекта ("Message owner") и с кандидатом ("Message" на заявке)
@Controller()
export class DirectController {
  constructor(private readonly direct: DirectService) {}

  @Post('projects/:projectId/direct')
  @HttpCode(200)
  @RateLimit({ name: 'direct-open', limit: 30, windowSec: 3600, by: 'user' })
  openWithOwner(@Param('projectId', UuidParamPipe) projectId: string, @CurrentUserId() userId: string) {
    return this.direct.openWithOwner(projectId, userId);
  }

  @Post('applications/:id/direct')
  @HttpCode(200)
  @RateLimit({ name: 'direct-open', limit: 30, windowSec: 3600, by: 'user' })
  openWithApplicant(@Param('id', UuidParamPipe) id: string, @CurrentUserId() userId: string) {
    return this.direct.openWithApplicant(id, userId);
  }

  @Get('direct')
  list(@CurrentUserId() userId: string) {
    return this.direct.list(userId);
  }

  @Get('direct/:id')
  get(@Param('id', UuidParamPipe) id: string, @CurrentUserId() userId: string) {
    return this.direct.get(id, userId);
  }

  @Get('direct/:id/messages')
  messages(
    @Param('id', UuidParamPipe) id: string,
    @CurrentUserId() userId: string,
    @Query() query: DirectMessagesQueryDto,
  ) {
    return this.direct.messages(id, userId, query.before);
  }

  @Post('direct/:id/messages')
  @RateLimit({ name: 'message', limit: 30, windowSec: 60, by: 'user' })
  send(@Param('id', UuidParamPipe) id: string, @CurrentUserId() userId: string, @Body() dto: SendDirectDto) {
    return this.direct.send(id, userId, dto.text);
  }

  @Post('direct/:id/read')
  @HttpCode(204)
  markRead(@Param('id', UuidParamPipe) id: string, @CurrentUserId() userId: string) {
    return this.direct.markRead(id, userId);
  }
}
