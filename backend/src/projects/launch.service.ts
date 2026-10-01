import { BadRequestException, Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { personJson } from '../common/sql.js';
import { DatabaseService } from '../database/database.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

const CHECK_EVERY_MS = 30 * 60 * 1000;

// Анонсы (проекты с датой запуска в будущем), "Notify me" и сам запуск
@Injectable()
export class LaunchService implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly db: DatabaseService,
    private readonly notifications: NotificationsService,
  ) {}

  // Проверяем запуски при старте сервера и потом каждые 30 минут.
  // На бесплатном Render сервер засыпает — тогда проверка просто случится, когда он проснётся
  onModuleInit() {
    this.notifyLaunched().catch((e) => console.warn('Launch check failed:', e.message));
    this.timer = setInterval(
      () => this.notifyLaunched().catch((e) => console.warn('Launch check failed:', e.message)),
      CHECK_EVERY_MS,
    );
    this.timer.unref();
  }

  onModuleDestroy() {
    clearInterval(this.timer);
  }

  // Ближайшие анонсы: главная (limit 3) и страница Announcements (все). Видны и гостям
  async list(viewerId: string | undefined, limit?: number) {
    // Заодно проверяем запуски: так подписчики узнают о запуске сразу, даже если сервер долго спал
    await this.notifyLaunched().catch((e) => console.warn('Launch check failed:', e.message));
    return this.db.query(
      `select p.id, p.title, p.description, p.icon, p.category,
              to_char(p.launch_at, 'YYYY-MM-DD') as "launchAt",
              (select ${personJson('o')} from users o where o.id = p.owner_id) as owner,
              (select count(*) from launch_subscribers s where s.project_id = p.id)::int as subscribers,
              exists (select 1 from launch_subscribers s where s.project_id = p.id and s.user_id = $1) as subscribed
       from projects p
       where p.launch_at > current_date
       order by p.launch_at, p.created_at
       limit $2`,
      [viewerId ?? null, limit ?? 100],
    );
  }

  async subscribe(projectId: string, userId: string) {
    const project = await this.db.queryOne<{ owner_id: string; announced: boolean }>(
      'select owner_id, launch_at > current_date as announced from projects where id = $1',
      [projectId],
    );
    if (!project) throw new NotFoundException('Project not found');
    if (!project.announced) throw new BadRequestException('This project has already launched');
    if (project.owner_id === userId) throw new BadRequestException("It's your project");
    await this.db.query(
      'insert into launch_subscribers (project_id, user_id) values ($1, $2) on conflict do nothing',
      [projectId, userId],
    );
    return this.subscription(projectId, userId);
  }

  async unsubscribe(projectId: string, userId: string) {
    await this.db.query('delete from launch_subscribers where project_id = $1 and user_id = $2', [projectId, userId]);
    return this.subscription(projectId, userId);
  }

  async subscription(projectId: string, userId: string) {
    const row = await this.db.queryOne<{ subscribed: boolean; subscribers: number }>(
      `select exists (select 1 from launch_subscribers where project_id = $1 and user_id = $2) as subscribed,
              (select count(*) from launch_subscribers where project_id = $1)::int as subscribers`,
      [projectId, userId],
    );
    return row!;
  }

  // Наступила дата запуска: отмечаем проект и одним запросом создаём уведомления всем подписчикам
  private async notifyLaunched() {
    const rows = await this.db.query<{ user_id: string }>(
      `with launched as (
         update projects set launch_notified = true
         where launch_at is not null and launch_at <= current_date and not launch_notified
         returning id, owner_id, title
       ),
       n as (
         insert into notifications (user_id, type, data)
         select s.user_id, 'project_launched',
                jsonb_build_object('actorId', l.owner_id, 'projectId', l.id, 'projectTitle', l.title)
         from launched l join launch_subscribers s on s.project_id = l.id
         returning user_id
       )
       select distinct user_id from n`,
    );
    rows.forEach((r) => this.notifications.push(r.user_id));
  }
}
