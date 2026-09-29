import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service.js';
import { UsersService } from '../users/users.service.js';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto/auth.dto.js';
import type { GoogleProfile } from './google.service.js';
import { SessionPayload } from './session.js';

type AuthRow = { id: string; email: string; password_hash: string | null; google_id: string | null; avatar_url: string | null };

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly users: UsersService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.db.queryOne('select 1 from users where email = $1', [dto.email]);
    if (exists) throw new ConflictException('An account with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const row = await this.db.queryOne<{ id: string }>(
      'insert into users (email, password_hash, name) values ($1, $2, $3) returning id',
      [dto.email, passwordHash, dto.name],
    );
    return this.session(row!.id);
  }

  async login(dto: LoginDto) {
    const user = await this.db.queryOne<AuthRow>('select * from users where email = $1', [dto.email]);
    // Одинаковая ошибка для "нет такого email" и "неверный пароль" — не подсказываем, какие email зарегистрированы
    const valid = user?.password_hash && (await bcrypt.compare(dto.password, user.password_hash));
    if (!user || !valid) throw new UnauthorizedException('Wrong email or password');
    return this.session(user.id);
  }

  // Вход через Google: по google_id → по подтверждённому email (привязываем) → новый аккаунт
  async loginWithGoogle(profile: GoogleProfile) {
    const byGoogle = await this.db.queryOne<AuthRow>('select * from users where google_id = $1', [profile.googleId]);
    if (byGoogle) return { ...(await this.session(byGoogle.id)), isNew: false };

    const byEmail = await this.db.queryOne<AuthRow>('select * from users where email = $1', [profile.email]);
    if (byEmail) {
      if (!profile.emailVerified) throw new ConflictException('google_unverified');
      await this.linkGoogle(byEmail.id, profile);
      return { ...(await this.session(byEmail.id)), isNew: false };
    }

    const row = await this.db.queryOne<{ id: string }>(
      'insert into users (email, google_id, name, avatar_url) values ($1, $2, $3, $4) returning id',
      [profile.email, profile.googleId, profile.name, profile.picture],
    );
    return { ...(await this.session(row!.id)), isNew: true };
  }

  async linkGoogle(userId: string, profile: GoogleProfile) {
    const taken = await this.db.queryOne<{ id: string }>('select id from users where google_id = $1', [profile.googleId]);
    if (taken && taken.id !== userId) throw new ConflictException('google_taken');
    await this.db.query(
      'update users set google_id = $2, avatar_url = coalesce(avatar_url, $3) where id = $1',
      [userId, profile.googleId, profile.picture],
    );
  }

  async unlinkGoogle(userId: string) {
    const user = await this.findAuthRow(userId);
    if (!user.password_hash) {
      throw new BadRequestException('Set a password first, otherwise you will lose access to your account');
    }
    await this.db.query('update users set google_id = null where id = $1', [userId]);
  }

  async account(userId: string) {
    const user = await this.findAuthRow(userId);
    return { email: user.email, hasPassword: Boolean(user.password_hash), googleLinked: Boolean(user.google_id) };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.findAuthRow(userId);
    if (user.password_hash) {
      const valid = dto.currentPassword && (await bcrypt.compare(dto.currentPassword, user.password_hash));
      if (!valid) throw new BadRequestException('Current password is incorrect');
    }
    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.db.query('update users set password_hash = $2 where id = $1', [userId, hash]);
  }

  private async findAuthRow(userId: string) {
    const user = await this.db.queryOne<AuthRow>('select * from users where id = $1', [userId]);
    if (!user) throw new UnauthorizedException('You need to sign in');
    return user;
  }

  private async session(userId: string) {
    const payload: SessionPayload = { sub: userId };
    const token = await this.jwt.signAsync(payload);
    const user = await this.users.findOne(userId);
    return { token, user };
  }
}
