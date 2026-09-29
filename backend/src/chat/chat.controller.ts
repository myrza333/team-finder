import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { CurrentUserId } from '../common/current-user.decorator.js';
import { UuidParamPipe } from '../common/uuid.js';
import { ChatService } from './chat.service.js';

class SendMessageDto {
  // Пробелы по краям убираем — сообщение из одних пробелов не пройдёт проверку длины
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 2000)
  text!: string;
}

class MessagesQueryDto {
  @IsOptional()
  @Matches(/^\d+$/)
  before?: string;
}

// Чат команды проекта. Id чата = id проекта
@Controller('chats')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.chat.list(userId);
  }

  @Get(':projectId/messages')
  messages(
    @Param('projectId', UuidParamPipe) projectId: string,
    @CurrentUserId() userId: string,
    @Query() query: MessagesQueryDto,
  ) {
    return this.chat.messages(projectId, userId, query.before);
  }

  @Post(':projectId/messages')
  send(
    @Param('projectId', UuidParamPipe) projectId: string,
    @CurrentUserId() userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chat.send(projectId, userId, dto.text);
  }

  @Post(':projectId/read')
  @HttpCode(204)
  markRead(@Param('projectId', UuidParamPipe) projectId: string, @CurrentUserId() userId: string) {
    return this.chat.markRead(projectId, userId);
  }
}
