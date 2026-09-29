-- Заявки, команда, уведомления и чат: чего не хватало в схеме 001

-- Системные сообщения в чате ("Aida Bekova joined the team") — без автора
alter table messages alter column user_id drop not null;

-- До какого момента участник прочитал чат команды: всё, что новее, — непрочитанное
alter table project_members add column last_read_at timestamptz not null default now();

-- Владелец смотрит заявки своего проекта
create index applications_project_idx on applications(project_id, status);
