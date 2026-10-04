import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUserId } from '../common/current-user.decorator.js';
import { RateLimit } from '../common/rate-limit.js';
import { UuidParamPipe } from '../common/uuid.js';
import { ApplicationsService } from './applications.service.js';
import { ApplicationsQueryDto, ApplyDto, DecideDto } from './dto/application.dto.js';

// Заявки "Хочу присоединиться"
@Controller()
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post('projects/:projectId/applications')
  @RateLimit({ name: 'apply', limit: 20, windowSec: 3600, by: 'user' })
  apply(
    @Param('projectId', UuidParamPipe) projectId: string,
    @CurrentUserId() userId: string,
    @Body() dto: ApplyDto,
  ) {
    return this.applications.apply(projectId, userId, dto);
  }

  // Входящие — заявки в мои проекты (?status=pending, ?projectId=...)
  @Get('applications/received')
  received(@CurrentUserId() userId: string, @Query() query: ApplicationsQueryDto) {
    return this.applications.received(userId, query);
  }

  // Мои заявки в чужие проекты (?projectId=... — заявка в конкретный проект)
  @Get('applications/sent')
  sent(@CurrentUserId() userId: string, @Query() query: ApplicationsQueryDto) {
    return this.applications.sent(userId, query.projectId);
  }

  @Get('applications/pending-counts')
  pendingCounts(@CurrentUserId() userId: string) {
    return this.applications.pendingCounts(userId);
  }

  // Владелец принимает или отклоняет
  @Patch('applications/:id')
  decide(@Param('id', UuidParamPipe) id: string, @CurrentUserId() userId: string, @Body() dto: DecideDto) {
    return this.applications.decide(id, userId, dto.status);
  }

  // Кандидат отзывает свою заявку
  @Delete('applications/:id')
  @HttpCode(204)
  withdraw(@Param('id', UuidParamPipe) id: string, @CurrentUserId() userId: string) {
    return this.applications.withdraw(id, userId);
  }
}
