import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUserId } from '../common/current-user.decorator.js';
import { UuidParamPipe } from '../common/uuid.js';
import { CreateProjectDto, ProjectsQueryDto, UpdateProjectDto } from './dto/project.dto.js';
import { ProjectsService } from './projects.service.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

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
}
