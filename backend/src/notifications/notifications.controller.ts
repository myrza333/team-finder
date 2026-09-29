import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CurrentUserId } from '../common/current-user.decorator.js';
import { UuidParamPipe } from '../common/uuid.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.notifications.list(userId);
  }

  // Для точки на колокольчике в шапке
  @Get('unread-count')
  unreadCount(@CurrentUserId() userId: string) {
    return this.notifications.unreadCount(userId);
  }

  @Post('read-all')
  @HttpCode(204)
  markAllRead(@CurrentUserId() userId: string) {
    return this.notifications.markAllRead(userId);
  }

  @Post(':id/read')
  @HttpCode(204)
  markRead(@CurrentUserId() userId: string, @Param('id', UuidParamPipe) id: string) {
    return this.notifications.markRead(userId, id);
  }
}
