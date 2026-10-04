import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import type { AuthedRequest } from '../auth/session.guard.js';

// Ограничение частоты запросов: защита от подбора пароля, массовых регистраций и спама.
// Счётчики живут в памяти сервера — у нас один сервер на Render, этого достаточно

type RateRule = {
  name: string; // правила с одним именем считаются вместе (например, сообщения в командных и личных чатах)
  limit: number;
  windowSec: number;
  by: 'ip' | 'user' | 'email'; // кого считаем: адрес, вошедшего пользователя или email из тела запроса (вход)
};

const RULES_KEY = 'rateLimit';
export const RateLimit = (...rules: RateRule[]) => SetMetadata(RULES_KEY, rules);

// Предохранитель от флуда: на любой запрос с одного адреса
const ANY_REQUEST: RateRule = { name: 'any', limit: 600, windowSec: 60, by: 'ip' };

// Запрос идёт через Vercel и прокси Render: настоящий адрес — первый в X-Forwarded-For
const clientIp = (req: AuthedRequest) =>
  String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || req.ip || 'unknown';

export const TOO_MANY = 'Too many requests. Please wait a bit and try again.';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();
  private nextSweep = 0;

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    if (context.getType() !== 'http') return true;
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const rules = [
      ANY_REQUEST,
      ...(this.reflector.getAllAndOverride<RateRule[]>(RULES_KEY, [context.getHandler(), context.getClass()]) ?? []),
    ];
    const now = Date.now();
    this.sweep(now);

    for (const rule of rules) {
      const who =
        rule.by === 'user' ? req.userId
        : rule.by === 'email' ? String(req.body?.email ?? '').trim().toLowerCase()
        : clientIp(req);
      if (!who) continue;

      const key = `${rule.name}:${who}`;
      let entry = this.hits.get(key);
      if (!entry || entry.resetAt <= now) {
        entry = { count: 0, resetAt: now + rule.windowSec * 1000 };
        this.hits.set(key, entry);
      }
      entry.count += 1;
      if (entry.count > rule.limit) {
        context.switchToHttp().getResponse<Response>().setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
        throw new HttpException(TOO_MANY, HttpStatus.TOO_MANY_REQUESTS);
      }
    }
    return true;
  }

  // Раз в минуту выбрасываем истёкшие счётчики, чтобы память не росла
  private sweep(now: number) {
    if (now < this.nextSweep) return;
    this.nextSweep = now + 60_000;
    for (const [key, entry] of this.hits) if (entry.resetAt <= now) this.hits.delete(key);
  }
}
