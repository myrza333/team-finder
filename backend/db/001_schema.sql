-- TeamFinder: схема базы данных
-- Как запустить: Supabase -> SQL Editor -> New query -> вставить весь файл -> Run.
-- Ролей у аккаунта нет: любой пользователь может и откликаться на проекты, и создавать свои.
-- "Работодатель" = владелец проекта (projects.owner_id).

-- ========== Пользователи ==========
create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text,                 -- null, если человек зарегистрировался через Google
  google_id     text unique,          -- id из Google, null для обычной регистрации
  name          text not null,
  title         text,                 -- "Junior Frontend Developer"
  bio           text,
  avatar_url    text,
  github_url    text,
  telegram_url  text,
  created_at    timestamptz not null default now(),
  -- должен быть хотя бы один способ входа
  constraint users_login_method check (password_hash is not null or google_id is not null)
);

-- ========== Навыки (React, Figma, Node.js...) ==========
create table skills (
  id   serial primary key,
  name text not null unique
);

-- Навыки пользователя (связь многие-ко-многим)
create table user_skills (
  user_id  uuid not null references users(id) on delete cascade,
  skill_id int  not null references skills(id) on delete cascade,
  primary key (user_id, skill_id)
);

-- ========== Проекты ==========
create table projects (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references users(id) on delete cascade,
  title       text not null,
  description text not null default '',
  image_url   text,
  status      text not null default 'open' check (status in ('open', 'closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index projects_owner_idx on projects(owner_id);

-- Стек проекта
create table project_skills (
  project_id uuid not null references projects(id) on delete cascade,
  skill_id   int  not null references skills(id) on delete cascade,
  primary key (project_id, skill_id)
);

-- Вакансии: кого ищет проект ("React Developer", "UI/UX Designer")
create table vacancies (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title      text not null,
  is_open    boolean not null default true
);
create index vacancies_project_idx on vacancies(project_id);

-- ========== Заявки "Хочу присоединиться" ==========
create table applications (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  vacancy_id uuid references vacancies(id) on delete set null,
  user_id    uuid not null references users(id) on delete cascade,
  message    text,
  status     text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)          -- одна заявка от человека на проект
);
create index applications_user_idx on applications(user_id);

-- ========== Участники команды ==========
-- Владелец тоже добавляется сюда при создании проекта, чтобы быть в чате
create table project_members (
  project_id uuid not null references projects(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  role_title text,                     -- "Backend Developer"
  joined_at  timestamptz not null default now(),
  primary key (project_id, user_id)
);
create index project_members_user_idx on project_members(user_id);

-- ========== Чат команды ==========
create table messages (
  id         bigserial primary key,
  project_id uuid not null references projects(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  text       text not null,
  created_at timestamptz not null default now()
);
create index messages_project_idx on messages(project_id, created_at);

-- ========== Уведомления ==========
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,  -- кому
  type       text not null,          -- 'application_new', 'application_accepted', ...
  data       jsonb not null default '{}',
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on notifications(user_id, is_read, created_at desc);

-- ========== Безопасность ==========
-- Supabase открывает таблицы из схемы public через свой публичный API.
-- Мы ходим в базу только из NestJS, поэтому включаем RLS без политик:
-- публичный API не видит ничего, а NestJS (подключается как владелец таблиц) работает как обычно.
alter table users            enable row level security;
alter table skills           enable row level security;
alter table user_skills      enable row level security;
alter table projects         enable row level security;
alter table project_skills   enable row level security;
alter table vacancies        enable row level security;
alter table applications     enable row level security;
alter table project_members  enable row level security;
alter table messages         enable row level security;
alter table notifications    enable row level security;

-- ========== Стартовый список навыков ==========
insert into skills (name) values
  ('JavaScript'), ('TypeScript'), ('React'), ('Next.js'), ('Vue'), ('Angular'),
  ('HTML/CSS'), ('SCSS'), ('Node.js'), ('NestJS'), ('Express'), ('Python'),
  ('Django'), ('FastAPI'), ('Go'), ('Java'), ('Spring'), ('C#'), ('.NET'),
  ('PHP'), ('Laravel'), ('PostgreSQL'), ('MongoDB'), ('Redis'), ('Docker'),
  ('Figma'), ('UI/UX'), ('Swift'), ('Kotlin'), ('Flutter'), ('React Native'),
  ('Unity'), ('Machine Learning'), ('DevOps'), ('QA');
