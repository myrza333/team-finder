import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { LaunchService } from './launch.service.js';
import { AnnouncementsController, ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { TeamService } from './team.service.js';

@Module({
  imports: [ChatModule, NotificationsModule],
  controllers: [ProjectsController, AnnouncementsController],
  providers: [ProjectsService, TeamService, LaunchService],
})
export class ProjectsModule {}
