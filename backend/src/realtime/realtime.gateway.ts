import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { SocketPayload } from '../auth/session.js';
import { DatabaseService } from '../database/database.service.js';

// Комнаты Socket.IO: у каждого пользователя своя (все его вкладки), у каждой команды — своя
const userRoom = (userId: string) => `user:${userId}`;
const projectRoom = (projectId: string) => `project:${projectId}`;

// Браузер подключается к бэкенду напрямую (не через /api фронтенда), поэтому проверяем, с какого сайта
const allowedOrigins = () => [process.env.FRONTEND_URL ?? 'http://localhost:3000'];

// Живые события: новые сообщения чата, уведомления, кто в сети.
// Всё остальное (отправка сообщений, заявки) идёт обычными HTTP-запросами — здесь только доставка.
@WebSocketGateway({
  cors: { origin: (origin: string | undefined, cb: (err: Error | null, ok?: boolean) => void) => cb(null, !origin || allowedOrigins().includes(origin)) },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private server!: Server;

  // Сколько открытых подключений (вкладок) у каждого пользователя: 0 — не в сети
  private readonly connections = new Map<string, number>();

  constructor(
    private readonly jwt: JwtService,
    private readonly db: DatabaseService,
  ) {}

  // Ошибки здесь обязательно ловим сами: Nest их не перехватывает, и необработанная ошибка
  // (например, база на секунду недоступна) роняет весь сервер
  async handleConnection(socket: Socket) {
    try {
      const userId = await this.authenticate(socket);
      if (!userId) return void socket.disconnect(true);

      // Мои команды (с участниками) и собеседники по личным чатам — параллельно
      const [teams, partners] = await Promise.all([
        this.db.query<{ project_id: string; members: string[] }>(
          `select pm.project_id,
                  array(select m.user_id::text from project_members m where m.project_id = pm.project_id) as members
           from project_members pm where pm.user_id = $1`,
          [userId],
        ),
        this.partnersOf(userId),
      ]);
      const projectIds = teams.map((t) => t.project_id);
      await socket.join([userRoom(userId), ...projectIds.map(projectRoom)]);

      // Считаем подключение только когда всё удалось — handleDisconnect смотрит на socket.data.userId
      socket.data.userId = userId;
      const count = (this.connections.get(userId) ?? 0) + 1;
      this.connections.set(userId, count);
      if (count === 1) {
        this.broadcastPresence(userId, projectIds, partners, true);
        // "Был в сети" — на случай, если отключение не успеет записаться (сервер перезапустили)
        this.db.query('update users set last_seen_at = now() where id = $1', [userId]).catch(() => {});
      }

      // Новому подключению — кто из "своих" (команды, личные чаты) уже в сети. Про остальных ему знать незачем
      const known = new Set([...teams.flatMap((t) => t.members), ...partners]);
      socket.emit('presence:list', [...this.connections.keys()].filter((id) => known.has(id)));
    } catch (e) {
      // Браузер сам переподключится через пару секунд
      console.warn('WebSocket connection failed:', (e as Error).message);
      socket.disconnect(true);
    }
  }

  async handleDisconnect(socket: Socket) {
    const userId: string | undefined = socket.data.userId;
    if (!userId) return;
    const count = (this.connections.get(userId) ?? 1) - 1;
    if (count > 0) return void this.connections.set(userId, count);

    this.connections.delete(userId);
    try {
      // Закрыл последнюю вкладку — запоминаем, когда был в сети, и сразу сообщаем своим
      const [projectIds, partners, seen] = await Promise.all([
        this.projectIdsOf(userId),
        this.partnersOf(userId),
        this.db.queryOne<{ at: Date }>('update users set last_seen_at = now() where id = $1 returning last_seen_at as at', [userId]),
      ]);
      this.broadcastPresence(userId, projectIds, partners, false, seen?.at);
    } catch (e) {
      console.warn('Presence update failed:', (e as Error).message);
    }
  }

  // ===== Для сервисов: кому и что отправить =====

  toUser(userId: string, event: string, payload?: unknown) {
    this.server.to(userRoom(userId)).emit(event, payload);
  }

  toProject(projectId: string, event: string, payload?: unknown) {
    this.server.to(projectRoom(projectId)).emit(event, payload);
  }

  // Человека приняли в команду / убрали из неё — его открытые вкладки начинают / перестают получать чат
  joinProject(userId: string, projectId: string) {
    this.server.in(userRoom(userId)).socketsJoin(projectRoom(projectId));
    this.toUser(userId, 'membership');
  }

  // Двое только что начали личный чат: рассказываем каждому, в сети ли другой (иначе точка будет серой до перезахода)
  introduce(a: string, b: string) {
    if (this.connections.has(a)) this.toUser(b, 'presence', { userId: a, online: true });
    if (this.connections.has(b)) this.toUser(a, 'presence', { userId: b, online: true });
  }

  leaveProject(userId: string, projectId: string) {
    this.server.in(userRoom(userId)).socketsLeave(projectRoom(projectId));
    this.toUser(userId, 'membership');
  }

  // ===== Внутреннее =====

  private async authenticate(socket: Socket) {
    const token: unknown = socket.handshake.auth?.token;
    if (typeof token !== 'string') return null;
    try {
      const payload = await this.jwt.verifyAsync<SocketPayload>(token);
      return payload.typ === 'socket' ? payload.sub : null;
    } catch {
      return null;
    }
  }

  private async projectIdsOf(userId: string) {
    const rows = await this.db.query<{ project_id: string }>(
      'select project_id from project_members where user_id = $1',
      [userId],
    );
    return rows.map((r) => r.project_id);
  }

  // С кем у меня личные чаты
  private async partnersOf(userId: string) {
    const rows = await this.db.query<{ id: string }>(
      `select distinct case when owner_id = $1 then user_id else owner_id end::text as id
       from direct_chats where owner_id = $1 or user_id = $1`,
      [userId],
    );
    return rows.map((r) => r.id);
  }

  // "В сети / не в сети" — товарищам по командам и собеседникам по личным чатам
  private broadcastPresence(userId: string, projectIds: string[], partners: string[], online: boolean, lastSeenAt?: Date) {
    const rooms = [...projectIds.map(projectRoom), ...partners.map(userRoom)];
    if (rooms.length) this.server.to(rooms).emit('presence', { userId, online, lastSeenAt });
  }
}
