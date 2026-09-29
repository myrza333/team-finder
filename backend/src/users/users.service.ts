import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { ensureSkillIds } from '../common/skills.js';
import { userJson } from '../common/sql.js';
import { UpdateProfileDto, UsersQueryDto } from './dto/user.dto.js';

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
        or exists (select 1 from user_skills us join skills s on s.id = us.skill_id
                   where us.user_id = u.id and s.name ilike ${q})
      )`);
    }
    if (query.role?.trim()) where.push(`u.title ilike ${param(`%${query.role.trim()}%`)}`);

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

  async findOne(id: string) {
    const row = await this.db.queryOne<{ user: unknown }>(
      `select ${userJson('u')} as user from users u where u.id = $1`,
      [id],
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
    return this.findOne(id);
  }

  async remove(id: string) {
    const rows = await this.db.query('delete from users where id = $1 returning id', [id]);
    if (!rows.length) throw new NotFoundException('User not found');
  }
}
