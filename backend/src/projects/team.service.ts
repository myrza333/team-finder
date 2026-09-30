import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ChatService } from '../chat/chat.service.js';
import { messageJson } from '../common/sql.js';
import { DatabaseService } from '../database/database.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';

type Message = { id: string; projectId: string };

// Команда проекта: убрать участника (владелец), выйти самому (участник), открыть/закрыть позицию
@Injectable()
export class TeamService {
  constructor(
    private readonly db: DatabaseService,
    private readonly chat: ChatService,
    private readonly notifications: NotificationsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async removeMember(projectId: string, ownerId: string, memberId: string) {
    const project = await this.db.queryOne<{ owner_id: string }>('select owner_id from projects where id = $1', [projectId]);
    if (!project) throw new NotFoundException('Project not found');
    if (project.owner_id !== ownerId) throw new ForbiddenException('Only the project owner can remove members');
    if (memberId === ownerId) throw new BadRequestException("You can't remove yourself — you're the owner");

    // Убираем из команды, удаляем его заявку (сможет подать снова), пишем в чат, уведомляем его
    const row = await this.db.queryOne<{ message: Message }>(
      `with gone as (
         delete from project_members where project_id = $1 and user_id = $2
         returning user_id
       ),
       who as (select u.id, u.name from gone join users u on u.id = gone.user_id),
       app as (delete from applications where project_id = $1 and user_id = (select id from who)),
       m as (
         insert into messages (project_id, text)
         select $1, who.name || ' was removed from the team' from who
         returning *
       ),
       n as (
         insert into notifications (user_id, type, data)
         select who.id, 'member_removed',
                jsonb_build_object('actorId', $3::uuid, 'projectId', p.id, 'projectTitle', p.title)
         from who, projects p
         where p.id = $1 and (select notify_team from users where id = who.id)
       )
       select ${messageJson('m', 'x')} as message from m left join users x on x.id = m.user_id`,
      [projectId, memberId, ownerId],
    );
    if (!row) throw new NotFoundException('This person is not in the team');

    this.realtime.leaveProject(memberId, projectId);
    this.notifications.push(memberId);
    this.chat.broadcast(row.message);
  }

  async leave(projectId: string, userId: string) {
    // Владелец выйти не может (иначе проект останется без хозяина) — только удалить проект
    const row = await this.db.queryOne<{ message: Message; owner_id: string }>(
      `with gone as (
         delete from project_members pm using projects p
         where pm.project_id = $1 and pm.user_id = $2 and p.id = pm.project_id and p.owner_id <> $2
         returning pm.user_id, p.owner_id, p.title
       ),
       who as (select u.id, u.name, gone.owner_id, gone.title from gone join users u on u.id = gone.user_id),
       app as (delete from applications where project_id = $1 and user_id = $2 and exists(select 1 from who)),
       m as (
         insert into messages (project_id, text)
         select $1, who.name || ' left the team' from who
         returning *
       ),
       n as (
         insert into notifications (user_id, type, data)
         select who.owner_id, 'member_left',
                jsonb_build_object('actorId', who.id, 'projectId', $1::uuid, 'projectTitle', who.title)
         from who
         where (select notify_team from users where id = who.owner_id)
       )
       select ${messageJson('m', 'x')} as message, (select owner_id from who) as owner_id
       from m left join users x on x.id = m.user_id`,
      [projectId, userId],
    );
    if (!row) {
      const owner = await this.db.queryOne('select 1 from projects where id = $1 and owner_id = $2', [projectId, userId]);
      if (owner) throw new BadRequestException("The owner can't leave the team. Delete the project instead.");
      throw new NotFoundException("You're not in this team");
    }

    this.realtime.leaveProject(userId, projectId);
    this.notifications.push(row.owner_id);
    this.chat.broadcast(row.message);
  }

  async setVacancyOpen(projectId: string, vacancyId: string, ownerId: string, isOpen: boolean) {
    const row = await this.db.queryOne<{ id: string; isOpen: boolean }>(
      `update vacancies v set is_open = $4
       from projects p
       where v.id = $2 and v.project_id = $1 and p.id = v.project_id and p.owner_id = $3
       returning v.id, v.is_open as "isOpen"`,
      [projectId, vacancyId, ownerId, isOpen],
    );
    if (!row) throw new NotFoundException('Position not found');
    return row;
  }
}
