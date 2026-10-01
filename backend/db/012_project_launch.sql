-- Анонсы проектов: проект с датой запуска в будущем — это анонс.
-- До запуска видны только название, короткое описание и дата; заявки закрыты.
-- В день запуска проект сам становится обычным, а подписчики ("Notify me") получают уведомление

alter table projects
  add column launch_at date,                                  -- null — проект уже запущен (как все старые)
  add column launch_notified boolean not null default false;  -- подписчикам уже сообщили о запуске

-- Кто нажал "Notify me" на анонсе
create table launch_subscribers (
  project_id uuid not null references projects(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);
alter table launch_subscribers enable row level security;

create index projects_launch_idx on projects(launch_at) where launch_at is not null;

-- Старые анонсы были отдельной таблицей с придуманными проектами — больше не нужны
drop table announcements;
