import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../database/database.service.js';
import { ensureSkillIds } from '../common/skills.js';
import { projectJson } from '../common/sql.js';
import { CreateProjectDto, ProjectsQueryDto, UpdateProjectDto, VacancyDto } from './dto/project.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: ProjectsQueryDto) {
    const params: unknown[] = [];
    const where: string[] = [];
    const param = (value: unknown) => {
      params.push(value);
      return `$${params.length}`;
    };

    if (query.q?.trim()) {
      const q = param(`%${query.q.trim()}%`);
      where.push(`(
        p.title ilike ${q} or p.description ilike ${q}
        or exists (select 1 from project_skills ps join skills s on s.id = ps.skill_id
                   where ps.project_id = p.id and s.name ilike ${q})
        or exists (select 1 from vacancies v where v.project_id = p.id and v.title ilike ${q})
      )`);
    }
    if (query.category) where.push(`p.category = ${param(query.category)}`);
    if (query.owner) where.push(`p.owner_id = ${param(query.owner)}`);
    if (query.member) {
      where.push(`exists (select 1 from project_members pm where pm.project_id = p.id and pm.user_id = ${param(query.member)})`);
    }

    const rows = await this.db.query<{ project: unknown }>(
      `select ${projectJson('p')} as project
       from projects p
       ${where.length ? `where ${where.join(' and ')}` : ''}
       order by p.created_at desc, p.id
       limit ${param(query.limit ?? 50)}`,
      params,
    );
    return rows.map((r) => r.project);
  }

  async findOne(id: string) {
    const row = await this.db.queryOne<{ project: unknown }>(
      `select ${projectJson('p')} as project from projects p where p.id = $1`,
      [id],
    );
    if (!row) throw new NotFoundException('Project not found');
    return row.project;
  }

  async create(ownerId: string, dto: CreateProjectDto) {
    const id = await this.db.transaction(async (client) => {
      const { rows } = await client.query<{ id: string }>(
        `insert into projects (owner_id, title, description, full_description, category, icon)
         values ($1, $2, $3, $4, $5, coalesce($6, '🚀'))
         returning id`,
        [ownerId, dto.title, dto.description, dto.fullDescription ?? '', dto.category, dto.icon ?? null],
      );
      const projectId = rows[0].id;

      // Владелец — первый участник команды; первая строка в чате — "X created the project"
      await client.query(
        `with owner as (select id, name, title from users where id = $2),
         member as (insert into project_members (project_id, user_id, role_title) select $1, id, title from owner)
         insert into messages (project_id, text) select $1, name || ' created the project' from owner`,
        [projectId, ownerId],
      );
      await this.replaceStack(client, projectId, dto.stack);
      await this.replaceVacancies(client, projectId, dto.vacancies);
      return projectId;
    });
    return this.findOne(id);
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    await this.assertOwner(id, userId);

    const columns: Record<string, unknown> = {
      title: dto.title,
      description: dto.description,
      full_description: dto.fullDescription,
      category: dto.category,
      icon: dto.icon,
      status: dto.status,
    };
    const changed = Object.entries(columns).filter(([, value]) => value !== undefined);

    await this.db.transaction(async (client) => {
      if (changed.length) {
        const set = changed.map(([column], i) => `${column} = $${i + 2}`).join(', ');
        await client.query(
          `update projects set ${set}, updated_at = now() where id = $1`,
          [id, ...changed.map(([, value]) => value)],
        );
      }
      if (dto.stack) await this.replaceStack(client, id, dto.stack);
      if (dto.vacancies) await this.replaceVacancies(client, id, dto.vacancies);
    });
    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    await this.assertOwner(id, userId);
    await this.db.query('delete from projects where id = $1', [id]);
  }

  private async assertOwner(projectId: string, userId: string) {
    const project = await this.db.queryOne<{ owner_id: string }>(
      'select owner_id from projects where id = $1',
      [projectId],
    );
    if (!project) throw new NotFoundException('Project not found');
    if (project.owner_id !== userId) throw new ForbiddenException('Only the project owner can do this');
  }

  private async replaceStack(client: PoolClient, projectId: string, stack: string[]) {
    await client.query('delete from project_skills where project_id = $1', [projectId]);
    const skillIds = await ensureSkillIds(client, stack);
    if (skillIds.length) {
      await client.query(
        'insert into project_skills (project_id, skill_id) select $1, unnest($2::int[])',
        [projectId, skillIds],
      );
    }
  }

  // Позиции с id обновляются (заявки на них сохраняют роль), без id — создаются, пропавшие из списка — удаляются.
  // Заявки на удалённые позиции остаются, но без роли (vacancy_id = null)
  private async replaceVacancies(client: PoolClient, projectId: string, vacancies: VacancyDto[]) {
    const keepIds = vacancies.map((v) => v.id).filter(Boolean);
    await client.query(
      'delete from vacancies where project_id = $1 and not (id = any($2::uuid[]))',
      [projectId, keepIds],
    );
    for (const [position, vacancy] of vacancies.entries()) {
      const { rows } = await client.query<{ id: string }>(
        vacancy.id
          ? `update vacancies set title = $2, position = $3, is_open = $4
             where id = $5 and project_id = $1 returning id`
          : `insert into vacancies (project_id, title, position, is_open) values ($1, $2, $3, $4) returning id`,
        [projectId, vacancy.title, position, vacancy.isOpen ?? true, ...(vacancy.id ? [vacancy.id] : [])],
      );
      if (!rows[0]) continue; // чужой или уже удалённый id — просто пропускаем
      await client.query('delete from vacancy_skills where vacancy_id = $1', [rows[0].id]);
      const skillIds = await ensureSkillIds(client, vacancy.skills ?? []);
      if (skillIds.length) {
        await client.query(
          'insert into vacancy_skills (vacancy_id, skill_id) select $1, unnest($2::int[])',
          [rows[0].id, skillIds],
        );
      }
    }
  }
}
