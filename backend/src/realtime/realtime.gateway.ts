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

  async handleConnection(socket: Socket) {
    const userId = await this.authenticate(socket);
    if (!userId) return socket.disconnect(true);
    socket.data.userId = userId;

    // Мои команды и их участники — одним запросом
    const teams = await this.db.query<{ project_id: string; members: string[] }>(
      `select pm.project_id,
              array(select m.user_id::text from project_members m where m.project_id = pm.project_id) as members
       from project_members pm where pm.user_id = $1`,
      [userId],
    );
    const projectIds = teams.map((t) => t.project_id);
    await socket.join([userRoom(userId), ...projectIds.map(projectRoom)]);

    const count = (this.connections.get(userId) ?? 0) + 1;
    this.connections.set(userId, count);
    if (count === 1) this.broadcastPresence(userId, projectIds, true);

    // Новому подключению — кто из товарищей по командам уже в сети (про остальных ему знать незачем)
    const teammates = new Set(teams.flatMap((t) => t.members));
    socket.emit('presence:list', [...this.connections.keys()].filter((id) => teammates.has(id)));
  }

  async handleDisconnect(socket: Socket) {
    const userId: string | undefined = socket.data.userId;
    if (!userId) return;
    const count = (this.connections.get(userId) ?? 1) - 1;
    if (count > 0) return void this.connections.set(userId, count);

    this.connections.delete(userId);
    this.broadcastPresence(userId, await this.projectIdsOf(userId), false);
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

  private broadcastPresence(userId: string, projectIds: string[], online: boolean) {
    if (projectIds.length) this.server.to(projectIds.map(projectRoom)).emit('presence', { userId, online });
  }
}
