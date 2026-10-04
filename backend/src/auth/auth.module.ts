import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GoogleService } from './google.service.js';
import { SESSION_TTL_SECONDS } from './session.js';
import { SessionGuard } from './session.guard.js';
import { RateLimitGuard } from '../common/rate-limit.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: SESSION_TTL_SECONDS },
      }),
    }),
  ],
  controllers: [AuthController],
  // Порядок важен: сначала узнаём пользователя по cookie, потом считаем его запросы
  providers: [
    AuthService,
    GoogleService,
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useClass: RateLimitGuard },
  ],
})
export class AuthModule {}
