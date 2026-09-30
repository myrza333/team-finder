-- Личные чаты "по поводу проекта": человек ↔ владелец проекта.
-- Один чат на пару (проект, человек). Сообщения хранятся отдельно от командного чата (messages),
-- чтобы личная переписка никогда не попала в чат команды
create table direct_chats (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references projects(id) on delete cascade,
  owner_id           uuid not null references users(id) on delete cascade,  -- владелец проекта
  user_id            uuid not null references users(id) on delete cascade,  -- тот, кто спрашивает / кандидат
  owner_last_read_at timestamptz not null default now(),
  user_last_read_at  timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  unique (project_id, user_id),
  check (owner_id <> user_id)
);
create index direct_chats_owner_idx on direct_chats(owner_id);
create index direct_chats_user_idx on direct_chats(user_id);

create table direct_messages (
  id         bigserial primary key,
  chat_id    uuid not null references direct_chats(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  text       text not null,
  created_at timestamptz not null default now()
);
create index direct_messages_chat_idx on direct_messages(chat_id, id);

alter table direct_chats    enable row level security;
alter table direct_messages enable row level security;

-- Settings → Notifications: "кто-то написал мне по поводу проекта" (только первое сообщение нового чата)
alter table users add column notify_direct boolean not null default true;
