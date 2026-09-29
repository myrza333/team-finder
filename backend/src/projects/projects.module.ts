import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { TeamService } from './team.service.js';

@Module({
  imports: [ChatModule, NotificationsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, TeamService],
})
export class ProjectsModule {}
