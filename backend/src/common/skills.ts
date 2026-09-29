import type { Queryable } from '../database/database.service.js';

// Возвращает id навыков по названиям, создавая недостающие
export async function ensureSkillIds(db: Queryable, names: string[]): Promise<number[]> {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (unique.length === 0) return [];

  await db.query(
    'insert into skills (name) select unnest($1::text[]) on conflict (name) do nothing',
    [unique],
  );
  const { rows } = await db.query<{ id: number }>(
    'select id from skills where name = any($1::text[])',
    [unique],
  );
  return rows.map((r) => r.id);
}
