import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export type GoogleProfile = {
  googleId: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture: string | null;
};

@Injectable()
export class GoogleService {
  private readonly client: OAuth2Client;
  private readonly clientId: string;

  constructor(config: ConfigService) {
    this.clientId = config.get<string>('GOOGLE_CLIENT_ID') ?? '';
    // Google возвращает человека на сайт (/api фронтенда проксируется сюда). Если адрес не задан явно —
    // берём его из FRONTEND_URL, чтобы забытая переменная не ломала вход ("Missing redirect_uri")
    const frontendUrl = config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    this.client = new OAuth2Client({
      clientId: this.clientId,
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET'),
      redirectUri: config.get<string>('GOOGLE_REDIRECT_URI') || `${frontendUrl}/api/auth/google/callback`,
    });
  }

  get isConfigured() {
    return Boolean(this.clientId);
  }

  authUrl(state: string) {
    return this.client.generateAuthUrl({
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'select_account',
    });
  }

  // Меняем одноразовый code на id_token и проверяем его подпись у Google
  async profileFromCode(code: string): Promise<GoogleProfile> {
    const { tokens } = await this.client.getToken(code);
    if (!tokens.id_token) throw new Error('Google did not return id_token');

    const ticket = await this.client.verifyIdToken({ idToken: tokens.id_token, audience: this.clientId });
    const p = ticket.getPayload();
    if (!p?.sub || !p.email) throw new Error('Google profile has no email');

    return {
      googleId: p.sub,
      email: p.email.toLowerCase(),
      emailVerified: Boolean(p.email_verified),
      name: p.name ?? p.email.split('@')[0],
      picture: p.picture ?? null,
    };
  }
}
