-- Демо-активность для seed-пользователей: заявки, переписка в чатах, уведомления.
-- Запускать после 003_seed.sql и 006_team_activity.sql. Можно запускать повторно: сначала удаляет старое.
-- Войти можно любым seed-пользователем, пароль password123 (например, timur@example.com — владелец AI Study Platform и LearnFlow).

delete from applications where project_id::text like 'b0000000-%';
delete from messages where project_id::text like 'b0000000-%';
delete from notifications where user_id::text like 'a0000000-%';

-- Аватарка Timur как в 003_seed (могла смениться при проверке загрузки фото)
update users set avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Timur'
where id = 'a0000000-0000-4000-8000-000000000001';

-- ===== Заявки =====
-- (проект, кто подал, на какую позицию, сообщение, статус, сколько времени назад)
insert into applications (project_id, user_id, vacancy_id, message, status, created_at)
select x.project_id::uuid, x.user_id::uuid, v.id, x.message, x.status, now() - x.ago::interval
from (values
  -- в AI Study Platform (владелец Timur)
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000006', 'Frontend Developer',
   'Hi! I have 2 years of experience with React and TypeScript and would love to help build the frontend.', 'pending', '2 hours'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'UI/UX Designer',
   'I''m a mobile developer, but I also design in Figma. Happy to help with the design system.', 'pending', '1 day'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'UI/UX Designer',
   'Love the idea! I''ve designed two edtech products before.', 'accepted', '19 days'),
  -- в LearnFlow (владелец Timur)
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000003', 'Fullstack Developer',
   'Fullstack with Node.js and PostgreSQL. I can start this week and spend ~10 hours per week.', 'pending', '2 days'),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000005', 'Content Creator',
   null, 'rejected', '21 days'),
  -- заявки Timur в чужие проекты
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Backend Developer',
   'I mostly do frontend, but I know Node.js well and want to grow as a backend developer.', 'pending', '9 days'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Frontend Developer',
   null, 'pending', '11 days'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Mobile Developer',
   'I''ve built two React Native apps, happy to help with the mobile client.', 'accepted', '14 days'),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Backend Developer',
   null, 'rejected', '19 days')
) as x(project_id, user_id, vacancy_title, message, status, ago)
left join vacancies v on v.project_id = x.project_id::uuid and v.title = x.vacancy_title;

-- ===== Чаты =====
-- Все уже прочитали всё, кроме двух свежих сообщений Aida в LearnFlow для Timur
update project_members set last_read_at = now() where project_id::text like 'b0000000-%';

insert into messages (project_id, user_id, text, created_at)
select x.project_id::uuid, x.user_id::uuid, x.text, now() - x.ago::interval
from (values
  ('b0000000-0000-4000-8000-000000000001', null, 'Timur Akmatov created the project', '9 days 3 hours'),
  ('b0000000-0000-4000-8000-000000000001', null, 'Aida Bekova joined the team', '8 days'),
  ('b0000000-0000-4000-8000-000000000001', null, 'Bek Osorov joined the team', '1 day 2 hours'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Hi everyone 👋', '3 hours 10 minutes'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'Hi! I''ll take care of the design', '3 hours 8 minutes'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 'Then I''m on the backend', '3 hours 5 minutes'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Great, I''ll do the frontend', '3 hours 3 minutes'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'I''ll start with wireframes tonight', '3 hours'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'Will drop the Figma link here when it''s ready', '2 hours 59 minutes'),

  ('b0000000-0000-4000-8000-000000000006', null, 'Timur Akmatov created the project', '17 days'),
  ('b0000000-0000-4000-8000-000000000006', null, 'Aida Bekova joined the team', '15 days'),

  ('b0000000-0000-4000-8000-000000000004', null, 'Bek Osorov created the project', '24 days'),
  ('b0000000-0000-4000-8000-000000000004', null, 'Daniyar Seitov joined the team', '20 days'),
  ('b0000000-0000-4000-8000-000000000004', null, 'Timur Akmatov joined the team', '14 days'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000003', 'Welcome, Timur! Let''s sync tomorrow at 11:00.', '14 days'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000005', 'I''ve pushed the first version of the model API.', '1 day 4 hours'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Nice, I''ll connect the mobile screens to it 👍', '1 day 3 hours'),

  ('b0000000-0000-4000-8000-000000000002', null, 'Alina Dzhaksybekova created the project', '12 days'),
  ('b0000000-0000-4000-8000-000000000002', null, 'Daniyar Seitov joined the team', '10 days'),
  ('b0000000-0000-4000-8000-000000000003', null, 'Aida Bekova created the project', '13 days'),
  ('b0000000-0000-4000-8000-000000000003', null, 'Kamila Nurova joined the team', '11 days'),
  ('b0000000-0000-4000-8000-000000000005', null, 'Kamila Nurova created the project', '22 days'),
  ('b0000000-0000-4000-8000-000000000005', null, 'Alina Dzhaksybekova joined the team', '20 days')
) as x(project_id, user_id, text, ago);

-- Эти два сообщения новее, чем Timur заходил в чат LearnFlow — у него будет 2 непрочитанных
insert into messages (project_id, user_id, text, created_at) values
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000002', 'I looked through the course structure — looks great!', now() + interval '1 second'),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000002', 'Can we add live sessions to the MVP, or is that phase 2?', now() + interval '2 seconds');

-- ===== Уведомления для Timur =====
insert into notifications (user_id, type, data, is_read, created_at)
select 'a0000000-0000-4000-8000-000000000001', x.type,
       jsonb_build_object('actorId', x.actor_id, 'projectId', x.project_id, 'projectTitle', p.title,
                          'applicationId', a.id),
       x.is_read, now() - x.ago::interval
from (values
  ('application_new', 'a0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', false, '2 hours'),
  ('application_new', 'a0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', false, '1 day'),
  ('application_new', 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000006', true, '2 days'),
  ('application_accepted', 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000004', true, '14 days'),
  ('application_rejected', 'a0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000005', true, '18 days')
) as x(type, actor_id, project_id, is_read, ago)
join projects p on p.id = x.project_id::uuid
left join applications a on a.project_id = p.id and a.user_id = x.actor_id::uuid and x.type = 'application_new';
