-- Загруженные фото профиля. Храним прямо в базе: картинка уже уменьшена в браузере до 256x256 (~20-40 КБ).
-- users.avatar_url при загрузке указывает на /api/users/<id>/avatar, откуда бэкенд и отдаёт картинку.
create table user_avatars (
  user_id    uuid primary key references users(id) on delete cascade,
  mime       text  not null,
  data       bytea not null,
  updated_at timestamptz not null default now()
);

alter table user_avatars enable row level security;
