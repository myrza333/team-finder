import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { personJson } from '../common/sql.js';
import { DatabaseService } from '../database/database.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';

const HISTORY_LIMIT = 100;

// Сообщение личного чата; a — автор
const directMessageJson = (m: string, a: string) => `json_build_object(
  'id', ${m}.id::text,
  'chatId', ${m}.chat_id,
  'text', ${m}.text,
  'createdAt', ${m}.created_at,
  'author', ${personJson(a)}
)`;

// Чат в списке: проект, собеседник (для меня — "другой"), последнее сообщение, непрочитанные.
// Ожидает алиасы: c — direct_chats, $1 — id текущего пользователя
const chatJson = `json_build_object(
  'id', c.id,
  'project', json_build_object('id', p.id, 'title', p.title, 'icon', p.icon, 'ownerId', p.owner_id),
  'other', (select ${personJson('o')} from users o where o.id = case when c.owner_id = $1 then c.user_id else c.owner_id end),
  'lastMessage', (
    select ${directMessageJson('m', 'a')}
    from direct_messages m join users a on a.id = m.user_id
    where m.chat_id = c.id order by m.id desc limit 1
  ),
  'unread', (
    select count(*) from direct_messages m
    where m.chat_id = c.id and m.user_id <> $1
      and m.created_at > case when c.owner_id = $1 then c.owner_last_read_at else c.user_last_read_at end
  )::int
)`;

// Личные чаты "по поводу проекта": человек ↔ владелец
@Injectable()
export class DirectService {
  constructor(
    private readonly db: DatabaseService,
    private readonly notifications: NotificationsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  // "Message owner" на странице проекта: найти или создать чат с владельцем
  async openWithOwner(projectId: string, userId: string) {
    const state = await this.db.queryOne<{ owner_id: string; member: boolean; chat_id: string | null }>(
      `select p.owner_id,
              exists(select 1 from project_members where project_id = p.id and user_id = $2) as member,
              (select id from direct_chats where project_id = p.id and user_id = $2) as chat_id
       from projects p where p.id = $1`,
      [projectId, userId],
    );
    if (!state) throw new NotFoundException('Project not found');
    if (state.owner_id === userId) throw new BadRequestException("This is your project — you can't message yourself");
    // Уже существующий чат открываем всегда; новый — только тем, кто ещё не в команде (у команды есть общий чат)
    if (state.chat_id) return { id: state.chat_id };
    if (state.member) throw new BadRequestException("You're already in this team — use the team chat");
    return this.create(projectId, state.owner_id, userId);
  }

  // "Message" на карточке заявки: владелец пишет кандидату
  async openWithApplicant(applicationId: string, ownerId: string) {
    const app = await this.db.queryOne<{ project_id: string; user_id: string; owner_id: string; chat_id: string | null }>(
      `select a.project_id, a.user_id, p.owner_id,
              (select id from direct_chats where project_id = a.project_id and user_id = a.user_id) as chat_id
       from applications a join projects p on p.id = a.project_id
       where a.id = $1`,
      [applicationId],
    );
    if (!app) throw new NotFoundException('Application not found');
    if (app.owner_id !== ownerId) throw new ForbiddenException('Only the project owner can do this');
    if (app.chat_id) return { id: app.chat_id };
    return this.create(app.project_id, ownerId, app.user_id);
  }

  private async create(projectId: string, ownerId: string, userId: string) {
    // on conflict — на случай двойного клика: второй запрос просто получит тот же чат
    const row = await this.db.queryOne<{ id: string }>(
      `insert into direct_chats (project_id, owner_id, user_id) values ($1, $2, $3)
       on conflict (project_id, user_id) do update set project_id = excluded.project_id
       returning id`,
      [projectId, ownerId, userId],
    );
    this.realtime.introduce(ownerId, userId);
    return { id: row!.id };
  }

  async list(userId: string) {
    return this.db.query(
      `select ${chatJson} as chat
       from direct_chats c join projects p on p.id = c.project_id
       where c.owner_id = $1 or c.user_id = $1
       order by coalesce((select max(m.created_at) from direct_messages m where m.chat_id = c.id), c.created_at) desc`,
      [userId],
    ).then((rows) => rows.map((r) => r.chat));
  }

  async get(chatId: string, userId: string) {
    const row = await this.db.queryOne(
      `select ${chatJson} as chat
       from direct_chats c join projects p on p.id = c.project_id
       where c.id = $2 and (c.owner_id = $1 or c.user_id = $1)`,
      [userId, chatId],
    );
    if (!row) throw new NotFoundException('Chat not found');
    return row.chat;
  }

  async messages(chatId: string, userId: string, before?: string) {
    const row = await this.db.queryOne<{ member: boolean; messages: unknown[] }>(
      `select exists(select 1 from direct_chats where id = $1 and (owner_id = $2 or user_id = $2)) as member,
              coalesce((
                select json_agg(x.message order by x.id)
                from (
                  select m.id, ${directMessageJson('m', 'a')} as message
                  from direct_messages m join users a on a.id = m.user_id
                  where m.chat_id = $1 and ($3::bigint is null or m.id < $3::bigint)
                  order by m.id desc limit ${HISTORY_LIMIT}
                ) x
              ), '[]') as messages`,
      [chatId, userId, before ?? null],
    );
    if (!row?.member) throw new NotFoundException('Chat not found');
    return row.messages;
  }

  async send(chatId: string, userId: string, text: string) {
    // Одним запросом: проверка участия, сообщение, "прочитано" для автора,
    // и уведомление собеседнику — только на первое сообщение чата и если он их не выключил
    const row = await this.db.queryOne<{ message: { chatId: string }; other_id: string; notified: boolean }>(
      `with chat as (
         select c.*, case when c.owner_id = $2 then c.user_id else c.owner_id end as other_id,
                not exists (select 1 from direct_messages where chat_id = c.id) as is_first
         from direct_chats c
         where c.id = $1 and (c.owner_id = $2 or c.user_id = $2)
       ),
       m as (
         insert into direct_messages (chat_id, user_id, text)
         select id, $2, $3 from chat
         returning *
       ),
       seen as (
         update direct_chats c set
           owner_last_read_at = case when c.owner_id = $2 then now() else c.owner_last_read_at end,
           user_last_read_at  = case when c.user_id  = $2 then now() else c.user_last_read_at end
         where c.id = (select id from chat)
       ),
       n as (
         insert into notifications (user_id, type, data)
         select chat.other_id, 'direct_new',
                jsonb_build_object('actorId', $2::uuid, 'projectId', p.id, 'projectTitle', p.title, 'chatId', chat.id)
         from chat
         join projects p on p.id = chat.project_id
         join users o on o.id = chat.other_id
         where chat.is_first and o.notify_direct
         returning id
       )
       select ${directMessageJson('m', 'a')} as message,
              (select other_id from chat) as other_id,
              exists(select 1 from n) as notified
       from m join users a on a.id = m.user_id`,
      [chatId, userId, text],
    );
    if (!row) throw new NotFoundException('Chat not found');

    // Доставляем обоим: собеседнику и другим открытым вкладкам автора
    this.realtime.toUser(row.other_id, 'direct:message', row.message);
    this.realtime.toUser(userId, 'direct:message', row.message);
    if (row.notified) this.notifications.push(row.other_id);
    return row.message;
  }

  async markRead(chatId: string, userId: string) {
    await this.db.query(
      `update direct_chats set
         owner_last_read_at = case when owner_id = $2 then now() else owner_last_read_at end,
         user_last_read_at  = case when user_id  = $2 then now() else user_last_read_at end
       where id = $1 and (owner_id = $2 or user_id = $2)`,
      [chatId, userId],
    );
  }
}
