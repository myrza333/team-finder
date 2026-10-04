import { ForbiddenException, Injectable } from '@nestjs/common';
import { messageJson, projectJson } from '../common/sql.js';
import { DatabaseService } from '../database/database.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';

const HISTORY_LIMIT = 100;

@Injectable()
export class ChatService {
  constructor(
    private readonly db: DatabaseService,
    private readonly realtime: RealtimeGateway,
  ) {}

  // Чаты = проекты, где я в команде. Сверху — где последнее сообщение новее
  async list(userId: string) {
    return this.db.query(
      `select ${projectJson('p')} as project,
              last.message as "lastMessage",
              (select count(*) from messages m
               where m.project_id = p.id and m.created_at > pm.last_read_at
                 and m.user_id is distinct from $1)::int as unread,
              -- Когда каждый участник был в сети: видно только товарищам по команде
              (select json_object_agg(u.id, u.last_seen_at)
               from project_members x join users u on u.id = x.user_id
               where x.project_id = p.id) as "lastSeen"
       from project_members pm
       join projects p on p.id = pm.project_id
       left join lateral (
         select ${messageJson('m', 'a')} as message, m.created_at
         from messages m left join users a on a.id = m.user_id
         where m.project_id = p.id
         order by m.id desc limit 1
       ) last on true
       where pm.user_id = $1
       order by coalesce(last.created_at, pm.joined_at) desc`,
      [userId],
    );
  }

  // Последние сообщения (по возрастанию времени). before — id сообщения, чтобы подгрузить более старые
  async messages(projectId: string, userId: string, before?: string) {
    // Один запрос: и проверка "ты в команде", и сами сообщения
    const row = await this.db.queryOne<{ member: boolean; messages: unknown[] }>(
      `select exists(select 1 from project_members where project_id = $1 and user_id = $2) as member,
              coalesce((
                select json_agg(x.message order by x.id)
                from (
                  select m.id, ${messageJson('m', 'a')} as message
                  from messages m left join users a on a.id = m.user_id
                  where m.project_id = $1 and ($3::bigint is null or m.id < $3::bigint)
                  order by m.id desc limit ${HISTORY_LIMIT}
                ) x
              ), '[]') as messages`,
      [projectId, userId, before ?? null],
    );
    if (!row?.member) throw new ForbiddenException("You're not a member of this team");
    return row.messages;
  }

  async send(projectId: string, userId: string, text: string) {
    // Вставляем, только если автор в команде; заодно своё сообщение сразу "прочитано"
    const row = await this.db.queryOne<{ message: { id: string } }>(
      `with member as (
         update project_members set last_read_at = now()
         where project_id = $1 and user_id = $2
         returning user_id
       ),
       m as (
         insert into messages (project_id, user_id, text)
         select $1, user_id, $3 from member
         returning *
       )
       select ${messageJson('m', 'a')} as message
       from m join users a on a.id = m.user_id`,
      [projectId, userId, text],
    );
    if (!row) throw new ForbiddenException("You're not a member of this team");
    this.realtime.toProject(projectId, 'chat:message', row.message);
    return row.message;
  }

  async markRead(projectId: string, userId: string) {
    await this.db.query(
      'update project_members set last_read_at = now() where project_id = $1 and user_id = $2',
      [projectId, userId],
    );
  }

  // Системное сообщение ("Aida joined the team") уже вставлено в базу запросом заявок/команды — рассылаем его
  broadcast(message: { projectId: string } | null | undefined) {
    if (message) this.realtime.toProject(message.projectId, 'chat:message', message);
  }
}
