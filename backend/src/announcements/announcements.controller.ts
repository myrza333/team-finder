import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

// Анонсы будущих проектов для главной. Правятся в Supabase → Table Editor → announcements.
// Команда и стек специально не хранятся — на сайте они показаны как "засекречено"
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly db: DatabaseService) {}

  // 3 ближайших, у которых старт ещё впереди (или сегодня). Видно и гостям
  @Get()
  upcoming() {
    return this.db.query(
      `select id, title, bio, icon, to_char(starts_at, 'YYYY-MM-DD') as "startsAt"
       from announcements
       where starts_at >= current_date
       order by starts_at, created_at
       limit 3`,
    );
  }
}
