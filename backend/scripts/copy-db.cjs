// Перенос базы в новый проект Supabase.
// Откуда — DATABASE_URL, куда — NEW_DATABASE_URL (обе строки в backend/.env).
// 1) Если в новой базе ещё нет таблиц — создаёт схему из db/*.sql (без демо-файлов 003 и 007).
// 2) Копирует все строки всех таблиц с теми же id.
// 3) Сравнивает количество строк в обеих базах.
// Старую базу скрипт только читает — там ничего не меняется.
//
// Запуск: npm run db:copy
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const env = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const read = (key) => env.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim();
const fromUrl = read('DATABASE_URL');
const toUrl = read('NEW_DATABASE_URL');

const SCHEMA_FILES = ['001_schema.sql', '002_projects_and_profile.sql', '004_more_skills.sql', '005_user_avatars.sql', '006_team_activity.sql', '008_project_icons.sql', '009_settings_and_announcements.sql', '010_direct_chats.sql'];

// Порядок важен: сначала то, на что ссылаются другие таблицы
const TABLES = [
  'users', 'skills', 'user_skills', 'projects', 'project_skills', 'vacancies', 'vacancy_skills',
  'applications', 'project_members', 'messages', 'notifications', 'user_avatars', 'announcements', 'direct_chats', 'direct_messages',
];

const host = (url) => url.replace(/^.*@/, '').replace(/\/.*$/, '');

async function main() {
  if (!fromUrl || !toUrl) throw new Error('В backend/.env нужны DATABASE_URL (старая база) и NEW_DATABASE_URL (новая)');
  if (fromUrl === toUrl) throw new Error('DATABASE_URL и NEW_DATABASE_URL одинаковые — это одна и та же база');

  const from = new Client({ connectionString: fromUrl, ssl: { rejectUnauthorized: false } });
  const to = new Client({ connectionString: toUrl, ssl: { rejectUnauthorized: false } });
  await from.connect();
  await to.connect();
  console.log(`Откуда: ${host(fromUrl)}\nКуда:   ${host(toUrl)}\n`);

  // Защита от ошибки "перепутал строки": в новой базе не должно быть пользователей
  const hasSchema = (await to.query("select to_regclass('public.users') as t")).rows[0].t;
  if (hasSchema) {
    const { count } = (await to.query('select count(*)::int as count from users')).rows[0];
    if (count > 0) throw new Error(`В новой базе уже есть ${count} пользователей — остановился, чтобы ничего не затереть`);
  } else {
    for (const file of SCHEMA_FILES) {
      await to.query(fs.readFileSync(path.join(__dirname, '..', 'db', file), 'utf8'));
      console.log(`схема: ${file} ✓`);
    }
  }

  await to.query('begin');
  try {
    // Навыки из схемы (001, 004) заменяем навыками старой базы — вместе с их id
    await to.query(`truncate ${TABLES.join(', ')} restart identity cascade`);

    for (const table of TABLES) {
      const { rows } = await from.query(`select * from ${table}`);
      for (let i = 0; i < rows.length; i += 200) {
        const chunk = rows.slice(i, i + 200);
        if (table === 'user_avatars') {
          // Картинки (bytea) нельзя передать через JSON — вставляем по одной
          for (const r of chunk) {
            await to.query('insert into user_avatars (user_id, mime, data, updated_at) values ($1, $2, $3, $4)',
              [r.user_id, r.mime, r.data, r.updated_at]);
          }
        } else {
          // Postgres сам разложит JSON по колонкам с нужными типами
          await to.query(`insert into ${table} select * from json_populate_recordset(null::${table}, $1)`, [JSON.stringify(chunk)]);
        }
      }
      console.log(`${table.padEnd(16)} ${rows.length} строк`);
    }

    // Счётчики автоинкремента — чтобы новые навыки/сообщения не получили уже занятый id
    await to.query("select setval(pg_get_serial_sequence('skills', 'id'), coalesce((select max(id) from skills), 1))");
    await to.query("select setval(pg_get_serial_sequence('messages', 'id'), coalesce((select max(id) from messages), 1))");
    await to.query("select setval(pg_get_serial_sequence('direct_messages', 'id'), coalesce((select max(id) from direct_messages), 1))");
    await to.query('commit');
  } catch (e) {
    await to.query('rollback');
    throw e;
  }

  console.log('\nПроверка — количество строк в старой и новой базе:');
  let ok = true;
  for (const table of TABLES) {
    const count = async (db) => (await db.query(`select count(*)::int as c from ${table}`)).rows[0].c;
    const [a, b] = [await count(from), await count(to)];
    if (a !== b) ok = false;
    console.log(`${table.padEnd(16)} ${a} → ${b} ${a === b ? '✓' : '✗ НЕ СОВПАДАЕТ'}`);
  }
  await from.end();
  await to.end();
  console.log(ok ? '\nГотово, всё совпадает.' : '\nЕсть расхождения — не переключайся на новую базу.');
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error('\n✗', e.message);
  process.exit(1);
});
