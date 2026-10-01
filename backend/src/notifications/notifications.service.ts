import { Injectable, NotFoundException } from '@nestjs/common';
import { personJson } from '../common/sql.js';
import { DatabaseService } from '../database/database.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';

// Что случилось. В базе хранится тип + id (кто, какой проект), текст собирается при выдаче
export type NotificationType =
  | 'application_new' // кто-то подал заявку в твой проект
  | 'application_accepted' // тебя приняли
  | 'application_rejected' // тебе отказали
  | 'member_removed' // тебя убрали из команды
  | 'member_left' // кто-то вышел из твоей команды
  | 'direct_new'; // тебе написали лично по поводу проекта (первое сообщение чата)

// Что лежит в notifications.data
export type NotificationData = { actorId: string; projectId: string; projectTitle: string; applicationId?: string; chatId?: string };

type Row = {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  actor: { id: string; name: string; title: string; avatarUrl: string | null } | null;
  projectId: string;
  projectTitle: string;
  chatId: string | null;
};

// Текст (после имени того, кто сделал) и куда ведёт клик
const describe = (n: Row): { text: string; href: string } => {
  const title = n.projectTitle;
  switch (n.type) {
    case 'application_new':
      return { text: `applied to your project ${title}`, href: `/my-projects/${n.projectId}` };
    case 'application_accepted':
      return { text: `accepted you to the ${title} team`, href: `/chat/${n.projectId}` };
    case 'application_rejected':
      return { text: `declined your application to ${title}`, href: `/projects/${n.projectId}` };
    case 'member_removed':
      return { text: `removed you from the ${title} team`, href: `/projects/${n.projectId}` };
    case 'member_left':
      return { text: `left the ${title} team`, href: `/my-projects/${n.projectId}` };
    case 'direct_new':
      return { text: `messaged you about ${title}`, href: n.chatId ? `/chat/d/${n.chatId}` : '/chat' };
  }
};

const deletedUser = { id: '', name: 'Deleted user', title: '', avatarUrl: null };

@Injectable()
export class NotificationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly realtime: RealtimeGateway,
  ) {}

  // Сами уведомления создаются SQL-ом прямо в запросах заявок и команды (так быстрее — один запрос в базу).
  // После этого сервис только "толкает" открытые вкладки получателя: там список и счётчик обновятся сами
  push(userId: string) {
    this.realtime.toUser(userId, 'notification');
  }

  async list(userId: string) {
    const rows = await this.db.query<Row>(
      `select n.id, n.type, n.is_read as read, n.created_at as "createdAt",
              case when a.id is null then null else ${personJson('a')} end as actor,
              n.data->>'projectId' as "projectId",
              coalesce(p.title, n.data->>'projectTitle') as "projectTitle",
              n.data->>'chatId' as "chatId"
       from notifications n
       left join users a on a.id = (n.data->>'actorId')::uuid
       left join projects p on p.id = (n.data->>'projectId')::uuid
       where n.user_id = $1
       order by n.created_at desc
       limit 50`,
      [userId],
    );
    return rows.map((n) => ({
      id: n.id,
      actor: n.actor ?? deletedUser,
      read: n.read,
      createdAt: n.createdAt,
      ...describe(n),
    }));
  }

  async unreadCount(userId: string) {
    const row = await this.db.queryOne<{ count: number }>(
      'select count(*)::int as count from notifications where user_id = $1 and not is_read',
      [userId],
    );
    return { count: row?.count ?? 0 };
  }

  async markRead(userId: string, id: string) {
    const rows = await this.db.query('update notifications set is_read = true where id = $1 and user_id = $2 returning id', [id, userId]);
    if (!rows.length) throw new NotFoundException('Notification not found');
  }

  async markAllRead(userId: string) {
    await this.db.query('update notifications set is_read = true where user_id = $1 and not is_read', [userId]);
  }
}
