import { Body, Controller, Delete, Get, HttpCode, Post, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import type { Response } from 'express';
import { CurrentUserId } from '../common/current-user.decorator.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto/auth.dto.js';
import { GoogleService } from './google.service.js';
import { SESSION_COOKIE, sessionCookieOptions } from './session.js';
import type { AuthedRequest } from './session.guard.js';

const OAUTH_COOKIE = 'tf_oauth';
const safePath = (value?: string) => (value?.startsWith('/') && !value.startsWith('//') ? value : '/');

@Controller('auth')
export class AuthController {
  private readonly frontendUrl: string;

  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly google: GoogleService,
    config: ConfigService,
  ) {
    this.frontendUrl = config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.auth.register(dto);
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
    return user;
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.auth.login(dto);
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
    return user;
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    const { maxAge, ...options } = sessionCookieOptions();
    res.clearCookie(SESSION_COOKIE, options);
  }

  @Get('me')
  me(@CurrentUserId() userId: string) {
    return this.users.findOne(userId);
  }

  // ===== Настройки входа =====

  @Get('account')
  account(@CurrentUserId() userId: string) {
    return this.auth.account(userId);
  }

  @Post('password')
  @HttpCode(204)
  changePassword(@CurrentUserId() userId: string, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(userId, dto);
  }

  @Delete('google')
  @HttpCode(204)
  unlinkGoogle(@CurrentUserId() userId: string) {
    return this.auth.unlinkGoogle(userId);
  }

  // ===== Google OAuth =====

  // Шаг 1: уводим на Google. state защищает от подделки ответа (CSRF), next — куда вернуть потом
  @Get('google')
  googleStart(@Query('next') next: string | undefined, @Res() res: Response) {
    if (!this.google.isConfigured) {
      return res.redirect(`${this.frontendUrl}/login?error=google_not_configured&next=${encodeURIComponent(safePath(next))}`);
    }

    const state = randomBytes(16).toString('hex');
    res.cookie(OAUTH_COOKIE, `${state}|${safePath(next)}`, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/auth/google',
      maxAge: 10 * 60 * 1000,
    });
    res.redirect(this.google.authUrl(state));
  }

  // Шаг 2: Google вернул code. Если человек уже вошёл — привязываем Google, иначе входим/регистрируем
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() req: AuthedRequest,
    @Res() res: Response,
  ) {
    const [savedState, savedNext] = String(req.cookies?.[OAUTH_COOKIE] ?? '').split('|');
    res.clearCookie(OAUTH_COOKIE, { path: '/api/auth/google' });
    const next = safePath(savedNext);
    const linking = Boolean(req.userId);
    const fail = (error: string) =>
      res.redirect(
        linking
          ? `${this.frontendUrl}/settings/account?error=${error}`
          : `${this.frontendUrl}/login?error=${error}&next=${encodeURIComponent(next)}`,
      );

    if (!code || !state || state !== savedState) return fail('google_failed');

    try {
      const profile = await this.google.profileFromCode(code);

      if (linking) {
        await this.auth.linkGoogle(req.userId!, profile);
        return res.redirect(`${this.frontendUrl}${next}`);
      }

      const { token, isNew } = await this.auth.loginWithGoogle(profile);
      res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
      res.redirect(`${this.frontendUrl}${isNew && next === '/' ? '/settings/profile' : next}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      fail(['google_taken', 'google_unverified'].includes(message) ? message : 'google_failed');
    }
  }
}
