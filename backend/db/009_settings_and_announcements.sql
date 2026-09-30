-- ========== Настройки приватности (Settings → Privacy) ==========
alter table users
  add column open_to_projects boolean not null default true,  -- значок "Open to projects" в профиле и карточке
  add column show_in_people   boolean not null default true,  -- false: не видно в People и поиске, профиль видят только товарищи по командам
  add column show_github      boolean not null default true,
  add column show_telegram    boolean not null default true,
  add column show_location    boolean not null default true;

-- ========== Уведомления на сайте (Settings → Notifications) ==========
alter table users
  add column notify_applications        boolean not null default true,  -- новые заявки в мои проекты
  add column notify_application_updates boolean not null default true,  -- мою заявку приняли / отклонили
  add column notify_team                boolean not null default true;  -- меня убрали из команды, кто-то вышел из моей команды

-- ========== Анонсы проектов на главной ==========
-- Меняются в Supabase → Table Editor → announcements. На главной показываются 3 ближайших, у которых старт ещё впереди
create table announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  bio        text not null,                    -- 1–2 предложения: о чём проект
  icon       text not null default 'rocket',   -- ключ иконки, как у projects.icon
  starts_at  date not null,                    -- дата старта: из неё считается "Starts in N days"
  created_at timestamptz not null default now()
);
create index announcements_starts_idx on announcements(starts_at);
alter table announcements enable row level security;

insert into announcements (title, bio, icon, starts_at) values
  ('Project Nova',
   'An AI assistant that turns lecture recordings into structured notes, flashcards and quizzes for students.',
   'ai', current_date + 14),
  ('Pixel Forge',
   'A cooperative browser game where teams build cities together in real time. Small scope, big ambitions.',
   'games', current_date + 30),
  ('Green Route',
   'A mobile app that plans city trips by bike and public transport and shows how much CO₂ you saved.',
   'mobile', current_date + 45);
