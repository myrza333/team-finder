import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SESSION_COOKIE } from '../auth/session.js';
import { CurrentUserId } from '../common/current-user.decorator.js';
import { UuidParamPipe } from '../common/uuid.js';
import { UpdateProfileDto, UsersQueryDto } from './dto/user.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll(@Query() query: UsersQueryDto) {
    return this.users.findAll(query);
  }

  // "me" объявлен раньше ":id", иначе Nest принял бы "me" за id
  @Get('me')
  me(@CurrentUserId() userId: string) {
    return this.users.findOne(userId);
  }

  @Patch('me')
  updateMe(@CurrentUserId() userId: string, @Body() dto: UpdateProfileDto) {
    return this.users.update(userId, dto);
  }

  @Delete('me')
  @HttpCode(204)
  async removeMe(@CurrentUserId() userId: string, @Res({ passthrough: true }) res: Response) {
    await this.users.remove(userId);
    res.clearCookie(SESSION_COOKIE, { path: '/' });
  }

  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string, @CurrentUserId() _userId: string) {
    return this.users.findOne(id);
  }
}
