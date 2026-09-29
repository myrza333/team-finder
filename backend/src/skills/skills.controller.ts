import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

@Controller('skills')
export class SkillsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async findAll() {
    const rows = await this.db.query<{ name: string }>('select name from skills order by name');
    return rows.map((r) => r.name);
  }
}
