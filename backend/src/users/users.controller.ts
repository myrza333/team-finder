import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { SESSION_COOKIE } from '../auth/session.js';
import { CurrentUserId } from '../common/current-user.decorator.js';
import { UuidParamPipe } from '../common/uuid.js';
import { UpdateProfileDto, UsersQueryDto } from './dto/user.dto.js';
import { type UploadedImage, UsersService } from './users.service.js';

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

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

  // Фото приходит как multipart/form-data в поле "file"
  @Put('me/avatar')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: AVATAR_MAX_BYTES } }))
  uploadAvatar(@CurrentUserId() userId: string, @UploadedFile() file: UploadedImage | undefined) {
    return this.users.setAvatar(userId, file);
  }

  @Delete('me/avatar')
  removeAvatar(@CurrentUserId() userId: string) {
    return this.users.removeAvatar(userId);
  }

  // Картинку видят и гости (аватарки есть в публичном списке People)
  @Get(':id/avatar')
  async avatar(@Param('id', UuidParamPipe) id: string, @Res() res: Response) {
    const { mime, data } = await this.users.getAvatar(id);
    res.set({
      'Content-Type': mime,
      'X-Content-Type-Options': 'nosniff',
      // В URL есть ?v=..., новая загрузка = новый URL, поэтому кэшировать можно надолго
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.send(data);
  }

  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string, @CurrentUserId() _userId: string) {
    return this.users.findOne(id);
  }
}
