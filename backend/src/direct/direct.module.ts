import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { DirectController } from './direct.controller.js';
import { DirectService } from './direct.service.js';

@Module({
  imports: [NotificationsModule],
  controllers: [DirectController],
  providers: [DirectService],
})
export class DirectModule {}
