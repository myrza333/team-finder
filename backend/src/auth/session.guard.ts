import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { SESSION_COOKIE, SessionPayload } from './session.js';

export type AuthedRequest = Request & { userId?: string };

// Глобальный guard: никого не блокирует, только узнаёт пользователя по cookie.
// Закрывать эндпоинты для гостей — задача @CurrentUserId() (он вернёт 401).
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = req.cookies?.[SESSION_COOKIE];
    if (token) {
      try {
        const payload = await this.jwt.verifyAsync<SessionPayload>(token);
        req.userId = payload.sub;
      } catch {
        req.userId = undefined;
      }
    }
    return true;
  }
}
