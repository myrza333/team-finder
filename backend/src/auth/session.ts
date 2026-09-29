import type { CookieOptions } from 'express';

export const SESSION_COOKIE = 'tf_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = { sub: string; typ?: undefined };

// Токен для WebSocket: браузер подключается к бэкенду напрямую, cookie сайта туда не попадает.
// Короткоживущий и с typ: 'socket' — вместо cookie сессии его использовать нельзя
export type SocketPayload = { sub: string; typ: 'socket' };
export const SOCKET_TOKEN_TTL_SECONDS = 60 * 60;

export const sessionCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_SECONDS * 1000,
});
