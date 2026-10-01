import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatService } from '../chat/chat.service.js';
import { messageJson, projectJson, userJson } from '../common/sql.js';
import { DatabaseService } from '../database/database.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
import { ApplicationsQueryDto, ApplyDto } from './dto/application.dto.js';

// Заявка целиком: проект, позиция, кто подал. Ожидает алиасы a (заявка), p, u (кандидат), v (позиция)
const applicationJson = `json_build_object(
  'id', a.id,
  'status', a.status,
  'message', a.message,
  'createdAt', a.created_at,
  'project', ${projectJson('p')},
  'vacancy', case when v.id is null then null else json_build_object(
    'id', v.id,
    'title', v.title,
    'isOpen', v.is_open,
    'skills', coalesce((
      select json_agg(s.name order by s.name)
      from vacancy_skills vs join skills s on s.id = vs.skill_id
      where vs.vacancy_id = v.id
    ), '[]')
  ) end,
  'applicant', ${userJson('u')}
)`;

// "a" может быть и таблицей applications, и CTE с только что изменённой строкой
const applicationFrom = (a: string) => `${a} a
  join projects p on p.id = a.project_id
  join users u on u.id = a.user_id
  left join vacancies v on v.id = a.vacancy_id`;

type Message = { id: string; projectId: string };

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly chat: ChatService,
    private readonly notifications: NotificationsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  // ===== Кандидат =====

  async apply(projectId: string, userId: string, dto: ApplyDto) {
    // Сначала одним запросом узнаём всё, что нужно для проверок, — чтобы дать понятную ошибку
    const state = await this.db.queryOne<{
      owner_id: string;
      status: 'open' | 'closed';
      member: boolean;
      existing: 'pending' | 'accepted' | 'rejected' | null;
      vacancy_open: boolean | null;
      announced: boolean;
    }>(
      `select p.owner_id, p.status, coalesce(p.launch_at > current_date, false) as announced,
              exists(select 1 from project_members where project_id = p.id and user_id = $2) as member,
              (select status from applications where project_id = p.id and user_id = $2) as existing,
              (select is_open from vacancies where id = $3 and project_id = p.id) as vacancy_open
       from projects p where p.id = $1`,
      [projectId, userId, dto.vacancyId ?? null],
    );
    if (!state) throw new NotFoundException('Project not found');
    if (state.owner_id === userId) throw new BadRequestException("This is your project — you're already in the team");
    if (state.member) throw new ConflictException("You're already in this team");
    if (state.existing === 'pending') throw new ConflictException("You've already applied to this project");
    if (state.existing === 'rejected') throw new ConflictException('Your application to this project was declined');
    if (state.announced) throw new BadRequestException("This project hasn't launched yet — applications open on launch day");
    if (state.status === 'closed') throw new BadRequestException("This project isn't looking for people right now");
    if (dto.vacancyId && state.vacancy_open === null) throw new BadRequestException('This position no longer exists');
    if (dto.vacancyId && !state.vacancy_open) throw new BadRequestException('This position is already filled');

    // Заявка + уведомление владельцу одним запросом
    try {
      const row = await this.db.queryOne<{ application: unknown; owner_id: string }>(
        `with a as (
           insert into applications (project_id, vacancy_id, user_id, message)
           values ($1, $3, $2, $4)
           returning *
         ),
         n as (
           insert into notifications (user_id, type, data)
           select p.owner_id, 'application_new',
                  jsonb_build_object('actorId', a.user_id, 'projectId', p.id, 'projectTitle', p.title, 'applicationId', a.id)
           from a join projects p on p.id = a.project_id
           join users o on o.id = p.owner_id
           where o.notify_applications -- владелец не выключил такие уведомления
         )
         select ${applicationJson} as application, p.owner_id
         from ${applicationFrom('a')}`,
        [projectId, userId, dto.vacancyId ?? null, dto.message ?? null],
      );
      this.notifications.push(row!.owner_id);
      return row!.application;
    } catch (e) {
      // Две заявки одновременно (двойной клик) — вторую не пускает unique (project_id, user_id)
      if ((e as { code?: string }).code === '23505') throw new ConflictException("You've already applied to this project");
      throw e;
    }
  }

  // Отозвать можно только ещё не рассмотренную заявку
  async withdraw(id: string, userId: string) {
    const row = await this.db.queryOne<{ owner_id: string }>(
      `with a as (
         delete from applications
         where id = $1 and user_id = $2 and status = 'pending'
         returning id, project_id
       ),
       n as (
         delete from notifications
         where type = 'application_new' and data->>'applicationId' = $1::text
       )
       select p.owner_id from a join projects p on p.id = a.project_id`,
      [id, userId],
    );
    if (!row) throw new NotFoundException('No pending application to withdraw');
    this.notifications.push(row.owner_id);
  }

  async sent(userId: string, projectId?: string) {
    const rows = await this.db.query<{ application: unknown }>(
      `select ${applicationJson} as application
       from ${applicationFrom('applications')}
       where a.user_id = $1 and ($2::uuid is null or a.project_id = $2)
       order by a.created_at desc`,
      [userId, projectId ?? null],
    );
    return rows.map((r) => r.application);
  }

  // ===== Владелец проекта =====

  async received(ownerId: string, query: ApplicationsQueryDto) {
    const rows = await this.db.query<{ application: unknown }>(
      `select ${applicationJson} as application
       from ${applicationFrom('applications')}
       where p.owner_id = $1
         and ($2::text is null or a.status = $2)
         and ($3::uuid is null or a.project_id = $3)
       order by a.created_at desc`,
      [ownerId, query.status ?? null, query.projectId ?? null],
    );
    return rows.map((r) => r.application);
  }

  // Сколько новых заявок: всего и по каждому проекту (для счётчиков в меню и в "My projects")
  async pendingCounts(ownerId: string) {
    const rows = await this.db.query<{ project_id: string; count: number }>(
      `select a.project_id, count(*)::int as count
       from applications a join projects p on p.id = a.project_id
       where p.owner_id = $1 and a.status = 'pending'
       group by a.project_id`,
      [ownerId],
    );
    return {
      total: rows.reduce((sum, r) => sum + r.count, 0),
      byProject: Object.fromEntries(rows.map((r) => [r.project_id, r.count])),
    };
  }

  async decide(id: string, ownerId: string, status: 'accepted' | 'rejected') {
    const current = await this.db.queryOne<{ status: string; user_id: string; project_id: string; owner_id: string }>(
      `select a.status, a.user_id, a.project_id, p.owner_id
       from applications a join projects p on p.id = a.project_id
       where a.id = $1`,
      [id],
    );
    if (!current) throw new NotFoundException('Application not found');
    if (current.owner_id !== ownerId) throw new ForbiddenException('Only the project owner can review applications');
    if (current.status !== 'pending') throw new ConflictException('This application has already been reviewed');

    const row = status === 'accepted' ? await this.accept(id, ownerId) : await this.reject(id, ownerId);
    // Кто-то успел изменить заявку между двумя запросами (например, кандидат её отозвал)
    if (!row) throw new ConflictException('This application has already been reviewed or withdrawn');

    this.notifications.push(current.user_id);
    if (status === 'accepted') {
      this.realtime.joinProject(current.user_id, current.project_id);
      this.chat.broadcast(row.message);
    }
    return row.application;
  }

  // Принять: статус, место в команде, позиция закрыта, сообщение в чат, уведомление — одним запросом
  private accept(id: string, ownerId: string) {
    return this.db.queryOne<{ application: unknown; message: Message }>(
      `with a as (
         update applications set status = 'accepted'
         where id = $1 and status = 'pending'
         returning *
       ),
       applicant as (
         select u.id, u.name, u.title from a join users u on u.id = a.user_id
       ),
       filled as (
         update vacancies set is_open = false where id = (select vacancy_id from a)
       ),
       joined as (
         insert into project_members (project_id, user_id, role_title)
         select a.project_id, a.user_id, coalesce((select title from vacancies where id = a.vacancy_id), applicant.title)
         from a, applicant
         on conflict do nothing
       ),
       m as (
         insert into messages (project_id, text)
         select a.project_id, applicant.name || ' joined the team' from a, applicant
         returning *
       ),
       n as (
         insert into notifications (user_id, type, data)
         select a.user_id, 'application_accepted',
                jsonb_build_object('actorId', $2::uuid, 'projectId', a.project_id, 'projectTitle', p.title)
         from a join projects p on p.id = a.project_id
         join users c on c.id = a.user_id
         where c.notify_application_updates
       )
       select ${applicationJson} as application,
              (select ${messageJson('m', 'x')} from m left join users x on x.id = m.user_id) as message
       from ${applicationFrom('a')}`,
      [id, ownerId],
    );
  }

  private reject(id: string, ownerId: string) {
    return this.db.queryOne<{ application: unknown; message: null }>(
      `with a as (
         update applications set status = 'rejected'
         where id = $1 and status = 'pending'
         returning *
       ),
       n as (
         insert into notifications (user_id, type, data)
         select a.user_id, 'application_rejected',
                jsonb_build_object('actorId', $2::uuid, 'projectId', a.project_id, 'projectTitle', p.title)
         from a join projects p on p.id = a.project_id
         join users c on c.id = a.user_id
         where c.notify_application_updates
       )
       select ${applicationJson} as application, null as message
       from ${applicationFrom('a')}`,
      [id, ownerId],
    );
  }
}
