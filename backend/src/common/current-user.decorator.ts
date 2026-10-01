import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { AuthedRequest } from '../auth/session.guard.js';

export const CurrentUserId = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const userId = ctx.switchToHttp().getRequest<AuthedRequest>().userId;
  if (!userId) throw new UnauthorizedException('You need to sign in');
  return userId;
});

// То же, но гость — не ошибка: вернёт undefined (для страниц, которые видны и без входа)
export const OptionalUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<AuthedRequest>().userId,
);
