import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { CurrentUserId, OptionalUserId } from '../common/current-user.decorator.js';
import { RateLimit } from '../common/rate-limit.js';
import { UuidParamPipe } from '../common/uuid.js';
import { CreateProjectDto, ProjectsQueryDto, UpdateProjectDto } from './dto/project.dto.js';
import { LaunchService } from './launch.service.js';
import { ProjectsService } from './projects.service.js';
import { TeamService } from './team.service.js';

class VacancyStatusDto {
  @IsBoolean()
  isOpen!: boolean;
}

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projects: ProjectsService,
    private readonly team: TeamService,
    private readonly launch: LaunchService,
  ) {}

  @Get()
  // Ответ — массив проектов; сколько всего подходит под фильтр — в заголовке X-Total-Count
  async findAll(
    @Query() query: ProjectsQueryDto,
    @OptionalUserId() viewerId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { items, total } = await this.projects.findAll(query, viewerId);
    res.setHeader('X-Total-Count', total);
    return items;
  }

  // Детальная страница только для вошедших. Чужой анонс отдаётся урезанным (см. announced.ts)
  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string, @CurrentUserId() userId: string) {
    return this.projects.findOne(id, userId);
  }

  // "Notify me" на анонсе: подписан ли я и сколько человек ждут запуска
  @Get(':id/notify-me')
  subscription(@Param('id', UuidParamPipe) id: string, @CurrentUserId() userId: string) {
    return this.launch.subscription(id, userId);
  }

  // Подписаться: сообщить, когда проект запустится
  @Post(':id/notify-me')
  @HttpCode(200)
  subscribe(@Param('id', UuidParamPipe) id: string, @CurrentUserId() userId: string) {
    return this.launch.subscribe(id, userId);
  }

  @Delete(':id/notify-me')
  unsubscribe(@Param('id', UuidParamPipe) id: string, @CurrentUserId() userId: string) {
    return this.launch.unsubscribe(id, userId);
  }

  @Post()
  @RateLimit({ name: 'project-create', limit: 10, windowSec: 3600, by: 'user' })
  create(@CurrentUserId() userId: string, @Body() dto: CreateProjectDto) {
    return this.projects.create(userId, dto);
  }

  @Patch(':id')
  update(
    @Param('id', UuidParamPipe) id: string,
    @CurrentUserId() userId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projects.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', UuidParamPipe) id: string, @CurrentUserId() userId: string) {
    return this.projects.remove(id, userId);
  }

  // ===== Команда =====

  // Выйти из команды самому. "me" объявлен раньше ":userId"
  @Delete(':id/members/me')
  @HttpCode(204)
  leave(@Param('id', UuidParamPipe) id: string, @CurrentUserId() userId: string) {
    return this.team.leave(id, userId);
  }

  // Владелец убирает участника
  @Delete(':id/members/:userId')
  @HttpCode(204)
  removeMember(
    @Param('id', UuidParamPipe) id: string,
    @Param('userId', UuidParamPipe) memberId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.team.removeMember(id, userId, memberId);
  }

  // Открыть / закрыть позицию, не трогая остальной проект
  @Patch(':id/vacancies/:vacancyId')
  setVacancyOpen(
    @Param('id', UuidParamPipe) id: string,
    @Param('vacancyId', UuidParamPipe) vacancyId: string,
    @CurrentUserId() userId: string,
    @Body() dto: VacancyStatusDto,
  ) {
    return this.team.setVacancyOpen(id, vacancyId, userId, dto.isOpen);
  }
}

class AnnouncementsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

// Анонсы — проекты с датой запуска в будущем. Главная берёт 3, страница Announcements — все
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly launch: LaunchService) {}

  @Get()
  list(@Query() query: AnnouncementsQueryDto, @OptionalUserId() viewerId?: string) {
    return this.launch.list(viewerId, query.limit);
  }
}
