import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database/database.service.js';

@Controller()
export class AppController {
  constructor(private readonly db: DatabaseService) {}

  // GET /health — проверка, что сервер жив и база отвечает
  @Get('health')
  async health() {
    const row = await this.db.queryOne<{ now: Date }>('select now()');
    return { status: 'ok', dbTime: row?.now };
  }
}
