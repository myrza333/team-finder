import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResultRow } from 'pg';

export type Queryable = Pick<PoolClient, 'query'>;

// Новое соединение с Supabase открывается ~3 с, а запрос по готовому идёт ~0.3 с.
// Но соединение, простоявшее без дела 1-2 минуты, обрывается по сети.
// Поэтому держим несколько соединений "тёплыми": каждые 25 с гоняем по ним select 1.
const WARM_CONNECTIONS = 3;
const HEARTBEAT_MS = 25_000;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;
  private heartbeat?: NodeJS.Timeout;

  constructor(config: ConfigService) {
    this.pool = new Pool({
      connectionString: config.getOrThrow<string>('DATABASE_URL'),
      ssl: { rejectUnauthorized: false },
      // Лишние соединения закрываем сами, пока их не оборвала сеть (обрыв после ~60 с простоя)
      idleTimeoutMillis: 50_000,
      // Ни один запрос не должен висеть вечно, даже если соединение умерло молча
      connectionTimeoutMillis: 10_000,
      query_timeout: 15_000,
      keepAlive: true,
    });
    // Оборванное простаивающее соединение пул выбрасывает и потом откроет новое — сервер не падает
    this.pool.on('error', (e) => console.warn('Idle database connection closed:', e.message));
  }

  async onModuleInit() {
    await this.warmUp().catch((e) => console.warn('Database warm-up failed:', e.message));
    this.heartbeat = setInterval(() => this.warmUp().catch(() => {}), HEARTBEAT_MS);
    this.heartbeat.unref();
  }

  // Параллельные запросы занимают разные соединения — так живыми остаются все WARM_CONNECTIONS
  private async warmUp() {
    await Promise.all(Array.from({ length: WARM_CONNECTIONS }, () => this.pool.query('select 1')));
  }

  async query<T extends QueryResultRow = any>(sql: string, params: unknown[] = []) {
    const result = await this.pool.query<T>(sql, params);
    return result.rows;
  }

  async queryOne<T extends QueryResultRow = any>(sql: string, params: unknown[] = []) {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      const result = await fn(client);
      await client.query('commit');
      return result;
    } catch (e) {
      await client.query('rollback');
      throw e;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy() {
    clearInterval(this.heartbeat);
    await this.pool.end();
  }
}
