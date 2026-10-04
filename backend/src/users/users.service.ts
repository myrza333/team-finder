import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { ensureSkillIds } from '../common/skills.js';
import { userJson } from '../common/sql.js';
import { UpdateProfileDto, UserSettingsDto, UsersQueryDto } from './dto/user.dto.js';

// Поле настроек в API → колонка в таблице users
const SETTINGS_COLUMNS: Record<keyof UserSettingsDto, string> = {
  openToProjects: 'open_to_projects',
  showInPeople: 'show_in_people',
  showGithub: 'show_github',
  showTelegram: 'show_telegram',
  showLocation: 'show_location',
  showSocials: 'show_socials',
  notifyApplications: 'notify_applications',
  notifyApplicationUpdates: 'notify_application_updates',
  notifyTeam: 'notify_team',
  notifyDirect: 'notify_direct',
};

const settingsJson = `json_build_object(${Object.entries(SETTINGS_COLUMNS)
  .map(([key, column]) => `'${key}', u.${column}`)
  .join(', ')})`;

export type UploadedImage = { buffer: Buffer; size: number };

// Тип картинки определяем по первым байтам файла, а не по тому, что прислал браузер
const imageMime = (buf: Buffer) => {
  if (buf.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (buf.subarray(0, 4).toString('ascii') === 'GIF8') return 'image/gif';
  return null;
};

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: UsersQueryDto) {
    const params: unknown[] = [];
    const where: string[] = [];
    const param = (value: unknown) => {
      params.push(value);
      return `$${params.length}`;
    };

    if (query.q?.trim()) {
      const q = param(`%${query.q.trim()}%`);
      where.push(`(
        u.name ilike ${q} or u.title ilike ${q}
        or exists (select 1 from unnest(u.stacks) st where st ilike ${q})
        or exists (select 1 from user_skills us join skills s on s.id = us.skill_id
                   where us.user_id = u.id and s.name ilike ${q})
      )`);
    }
    if (query.role?.trim()) where.push(`u.title ilike ${param(`%${query.role.trim()}%`)}`);
    // Кто выключил "Show me in People search" — в списке и поиске не появляется
    where.push('u.show_in_people');

    const rows = await this.db.query<{ user: unknown }>(
      `select ${userJson('u')} as user
       from users u
       ${where.length ? `where ${where.join(' and ')}` : ''}
       order by u.created_at, u.id
       limit ${param(query.limit ?? 50)}`,
      params,
    );
    return rows.map((r) => r.user);
  }

  // ===== Settings → Privacy / Notifications =====

  async getSettings(id: string) {
    const row = await this.db.queryOne(
      `select ${settingsJson} as settings from users u where u.id = $1`,
      [id],
    );
    if (!row) throw new NotFoundException('User not found');
    return row.settings;
  }

  async updateSettings(id: string, dto: UserSettingsDto) {
    const changed = Object.entries(SETTINGS_COLUMNS).filter(([key]) => dto[key as keyof UserSettingsDto] !== undefined);
    if (!changed.length) return this.getSettings(id);
    const set = changed.map(([, column], i) => `${column} = $${i + 2}`).join(', ');
    const row = await this.db.queryOne(
      `update users u set ${set} where u.id = $1 returning ${settingsJson} as settings`,
      [id, ...changed.map(([key]) => dto[key as keyof UserSettingsDto])],
    );
    if (!row) throw new NotFoundException('User not found');
    return row.settings;
  }

  // Свой профиль — со всеми полями, даже скрытыми настройками приватности (нужно для формы профиля)
  async findOwn(id: string) {
    const row = await this.db.queryOne<{ user: unknown }>(
      `select ${userJson('u', true)} as user from users u where u.id = $1`,
      [id],
    );
    if (!row) throw new NotFoundException('User not found');
    return row.user;
  }

  // Чужой профиль. Скрытого из People видят только он сам и его товарищи по командам
  async findVisible(id: string, viewerId: string) {
    const row = await this.db.queryOne<{ user: unknown }>(
      `select ${userJson('u')} as user from users u
       where u.id = $1 and (
         u.show_in_people or u.id = $2
         or exists (select 1 from project_members a join project_members b on b.project_id = a.project_id
                    where a.user_id = u.id and b.user_id = $2)
       )`,
      [id, viewerId],
    );
    if (!row) throw new NotFoundException('User not found');
    return row.user;
  }

  async update(id: string, dto: UpdateProfileDto) {
    const columns: Record<string, unknown> = {
      name: dto.name,
      title: dto.title,
      bio: dto.bio,
      location: dto.location,
      avatar_url: dto.avatarUrl,
      github_url: dto.githubUrl,
      telegram_url: dto.telegramUrl,
      linkedin_url: dto.linkedinUrl,
      instagram_url: dto.instagramUrl,
      codewars_url: dto.codewarsUrl,
      leetcode_url: dto.leetcodeUrl,
      stacks: dto.stacks,
    };
    const changed = Object.entries(columns).filter(([, value]) => value !== undefined);

    await this.db.transaction(async (client) => {
      if (changed.length) {
        const set = changed.map(([column], i) => `${column} = $${i + 2}`).join(', ');
        const { rowCount } = await client.query(
          `update users set ${set} where id = $1`,
          [id, ...changed.map(([, value]) => value)],
        );
        if (!rowCount) throw new NotFoundException('User not found');
      }
      if (dto.skills) {
        await client.query('delete from user_skills where user_id = $1', [id]);
        const skillIds = await ensureSkillIds(client, dto.skills);
        if (skillIds.length) {
          await client.query(
            'insert into user_skills (user_id, skill_id) select $1, unnest($2::int[])',
            [id, skillIds],
          );
        }
      }
    });
    return this.findOwn(id);
  }

  async setAvatar(id: string, file: UploadedImage | undefined) {
    if (!file) throw new BadRequestException('Choose an image file');
    const mime = imageMime(file.buffer);
    if (!mime) throw new BadRequestException('Only JPG, PNG, WebP or GIF images are allowed');

    // ?v= меняется при каждой загрузке, чтобы браузер не показывал старую картинку из кэша
    const url = `/api/users/${id}/avatar?v=${Date.now()}`;
    // Один запрос вместо транзакции: база далеко, каждый лишний запрос — плюс ~0.4 с
    return this.userFromQuery(
      `with saved as (
         insert into user_avatars (user_id, mime, data) values ($1, $3, $4)
         on conflict (user_id) do update set mime = excluded.mime, data = excluded.data, updated_at = now()
       ),
       u as (update users set avatar_url = $2 where id = $1 returning *)
       select ${userJson('u', true)} as user from u`,
      [id, url, mime, file.buffer],
    );
  }

  async removeAvatar(id: string) {
    return this.userFromQuery(
      `with removed as (delete from user_avatars where user_id = $1),
       u as (update users set avatar_url = null where id = $1 returning *)
       select ${userJson('u', true)} as user from u`,
      [id],
    );
  }

  private async userFromQuery(sql: string, params: unknown[]) {
    const row = await this.db.queryOne<{ user: unknown }>(sql, params);
    if (!row) throw new NotFoundException('User not found');
    return row.user;
  }

  async getAvatar(id: string) {
    const row = await this.db.queryOne<{ mime: string; data: Buffer }>(
      'select mime, data from user_avatars where user_id = $1',
      [id],
    );
    if (!row) throw new NotFoundException('Avatar not found');
    return row;
  }

  async remove(id: string) {
    const rows = await this.db.query('delete from users where id = $1 returning id', [id]);
    if (!rows.length) throw new NotFoundException('User not found');
  }
}
