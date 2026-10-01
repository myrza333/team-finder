import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ChatModule } from './chat/chat.module.js';
import { DatabaseModule } from './database/database.module.js';
import { DirectModule } from './direct/direct.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';
import { SkillsController } from './skills/skills.controller.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RealtimeModule,
    AuthModule,
    ProjectsModule,
    UsersModule,
    ApplicationsModule,
    ChatModule,
    NotificationsModule,
    DirectModule,
  ],
  controllers: [AppController, SkillsController],
})
export class AppModule {}
