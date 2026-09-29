import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { IsBoolean } from 'class-validator';
import { CurrentUserId } from '../common/current-user.decorator.js';
import { UuidParamPipe } from '../common/uuid.js';
import { CreateProjectDto, ProjectsQueryDto, UpdateProjectDto } from './dto/project.dto.js';
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
  ) {}

  @Get()
  findAll(@Query() query: ProjectsQueryDto) {
    return this.projects.findAll(query);
  }

  // Детальная страница только для вошедших
  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string, @CurrentUserId() _userId: string) {
    return this.projects.findOne(id);
  }

  @Post()
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
