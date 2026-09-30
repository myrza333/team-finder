-- Тестовые данные для разработки. Можно запускать повторно: сначала удаляет старые записи.
-- Пароль всех seed-пользователей: password123 (в базе хранится только bcrypt-хеш).

delete from users where id::text like 'a0000000-%';

insert into skills (name) values
  ('Tailwind CSS'), ('Prototyping'), ('Design Systems'), ('LangChain'), ('CI/CD'), ('Vue.js'),
  ('Three.js'), ('Socket.io'), ('Prisma'), ('WebRTC'), ('Pandas'), ('WebGL'), ('Dart'), ('Writing'), ('Video'),
  ('Kubernetes'), ('FastAPI'), ('TensorFlow')
on conflict (name) do nothing;

insert into users (id, email, password_hash, name, title, bio, location, avatar_url, github_url, telegram_url) values
  ('a0000000-0000-4000-8000-000000000001', 'timur@example.com', '$2b$10$HNqr0QTbKWIDNMb1zJmduuyRp32ArQihUHTFGQSa91kskRoKkyfw.', 'Timur Akmatov', 'Junior Frontend Developer',
   'Passionate frontend developer with a love for clean UI and modern web technologies.', 'Bishkek, Kyrgyzstan',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=Timur', 'https://github.com/timur-akmatov', 'https://t.me/timur_ak'),
  ('a0000000-0000-4000-8000-000000000002', 'aida@example.com', '$2b$10$HNqr0QTbKWIDNMb1zJmduuyRp32ArQihUHTFGQSa91kskRoKkyfw.', 'Aida Bekova', 'UI/UX Designer',
   'Product designer focused on simple, accessible interfaces and design systems.', 'Almaty, Kazakhstan',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=Aida', 'https://github.com/aidabekova', 'https://t.me/aida_design'),
  ('a0000000-0000-4000-8000-000000000003', 'bek@example.com', '$2b$10$HNqr0QTbKWIDNMb1zJmduuyRp32ArQihUHTFGQSa91kskRoKkyfw.', 'Bek Osorov', 'Backend Developer',
   null, null, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bek', null, 'https://t.me/bek_osorov'),
  ('a0000000-0000-4000-8000-000000000004', 'alina@example.com', '$2b$10$HNqr0QTbKWIDNMb1zJmduuyRp32ArQihUHTFGQSa91kskRoKkyfw.', 'Alina Dzhaksybekova', 'Mobile Developer',
   null, null, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alina', null, null),
  ('a0000000-0000-4000-8000-000000000005', 'daniyar@example.com', '$2b$10$HNqr0QTbKWIDNMb1zJmduuyRp32ArQihUHTFGQSa91kskRoKkyfw.', 'Daniyar Seitov', 'AI/ML Engineer',
   null, null, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniyar', null, null),
  ('a0000000-0000-4000-8000-000000000006', 'kamila@example.com', '$2b$10$HNqr0QTbKWIDNMb1zJmduuyRp32ArQihUHTFGQSa91kskRoKkyfw.', 'Kamila Nurova', 'DevOps Engineer',
   null, null, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kamila', null, null);

insert into user_skills (user_id, skill_id)
select u.id::uuid, s.id
from (values
  ('a0000000-0000-4000-8000-000000000001', array['React', 'TypeScript', 'Next.js', 'SCSS', 'Node.js']),
  ('a0000000-0000-4000-8000-000000000002', array['Figma', 'Prototyping', 'Design Systems']),
  ('a0000000-0000-4000-8000-000000000003', array['Node.js', 'PostgreSQL', 'Docker']),
  ('a0000000-0000-4000-8000-000000000004', array['React Native', 'Flutter', 'Swift']),
  ('a0000000-0000-4000-8000-000000000005', array['Python', 'Machine Learning', 'LangChain']),
  ('a0000000-0000-4000-8000-000000000006', array['Kubernetes', 'Docker', 'CI/CD'])
) as u(id, skills)
cross join lateral unnest(u.skills) as skill_name
join skills s on s.name = skill_name
on conflict do nothing;

insert into projects (id, owner_id, title, description, full_description, icon, category) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'AI Study Platform',
   'An adaptive learning platform that uses AI to personalize study plans for students.',
   'We are building an AI-powered study platform that adapts to each student''s learning style and pace. The platform analyzes performance data to generate personalized content, quizzes, and study schedules.',
   'education', 'AI'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000004', 'EcoTracker',
   'A mobile app for tracking personal carbon footprint and finding eco-friendly alternatives.',
   'EcoTracker helps individuals and families understand and reduce their carbon footprint through daily tracking, gamification, and community challenges.',
   'nature', 'Mobile'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'DevConnect',
   'Real-time collaboration tool for distributed development teams with built-in code review.',
   'DevConnect is a collaboration platform that brings code review, pair programming, and team communication into one unified workspace for remote teams.',
   'code', 'Development'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000003', 'HealthMate',
   'AI-powered health monitoring app that connects patients with specialists.',
   'HealthMate uses machine learning to analyze health metrics and provide early warnings for potential health issues, connecting users with appropriate medical professionals.',
   'health', 'AI'),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000006', 'GameVerse',
   'Multiplayer browser game platform with real-time leaderboards and tournaments.',
   'GameVerse is a browser-based gaming platform where indie developers can publish their games and players can compete in real-time tournaments with friends.',
   'games', 'Games'),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'LearnFlow',
   'Interactive coding bootcamp platform with live mentoring sessions.',
   'LearnFlow provides structured learning paths for aspiring developers with live coding sessions, real projects, and mentor support throughout the journey.',
   'books', 'Education');

insert into project_skills (project_id, skill_id)
select p.id::uuid, s.id
from (values
  ('b0000000-0000-4000-8000-000000000001', array['React', 'Node.js', 'PostgreSQL']),
  ('b0000000-0000-4000-8000-000000000002', array['React Native', 'Python', 'MongoDB']),
  ('b0000000-0000-4000-8000-000000000003', array['Vue.js', 'Go', 'Redis']),
  ('b0000000-0000-4000-8000-000000000004', array['Flutter', 'FastAPI', 'TensorFlow']),
  ('b0000000-0000-4000-8000-000000000005', array['Three.js', 'Socket.io', 'PostgreSQL']),
  ('b0000000-0000-4000-8000-000000000006', array['Next.js', 'Prisma', 'WebRTC'])
) as p(id, skills)
cross join lateral unnest(p.skills) as skill_name
join skills s on s.name = skill_name;

insert into project_members (project_id, user_id, role_title)
select m.project_id::uuid, m.user_id::uuid, u.title
from (values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000004'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000005'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000006'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000003'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000005'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000006'),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000004'),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000002')
) as m(project_id, user_id)
join users u on u.id = m.user_id::uuid;

with v as (
  insert into vacancies (project_id, title, position)
  values
    ('b0000000-0000-4000-8000-000000000001', 'Frontend Developer', 0),
    ('b0000000-0000-4000-8000-000000000001', 'UI/UX Designer', 1),
    ('b0000000-0000-4000-8000-000000000002', 'Backend Developer', 0),
    ('b0000000-0000-4000-8000-000000000002', 'Data Scientist', 1),
    ('b0000000-0000-4000-8000-000000000003', 'Frontend Developer', 0),
    ('b0000000-0000-4000-8000-000000000003', 'DevOps Engineer', 1),
    ('b0000000-0000-4000-8000-000000000004', 'Mobile Developer', 0),
    ('b0000000-0000-4000-8000-000000000004', 'ML Engineer', 1),
    ('b0000000-0000-4000-8000-000000000005', 'Game Developer', 0),
    ('b0000000-0000-4000-8000-000000000005', 'Backend Developer', 1),
    ('b0000000-0000-4000-8000-000000000006', 'Fullstack Developer', 0),
    ('b0000000-0000-4000-8000-000000000006', 'Content Creator', 1)
  returning id, project_id, title
)
insert into vacancy_skills (vacancy_id, skill_id)
select v.id, s.id
from v
join (values
  ('b0000000-0000-4000-8000-000000000001', 'Frontend Developer', array['React', 'TypeScript']),
  ('b0000000-0000-4000-8000-000000000001', 'UI/UX Designer', array['Figma', 'Prototyping']),
  ('b0000000-0000-4000-8000-000000000002', 'Backend Developer', array['Python', 'MongoDB']),
  ('b0000000-0000-4000-8000-000000000002', 'Data Scientist', array['Python', 'Pandas']),
  ('b0000000-0000-4000-8000-000000000003', 'Frontend Developer', array['Vue.js', 'TypeScript']),
  ('b0000000-0000-4000-8000-000000000003', 'DevOps Engineer', array['Docker', 'CI/CD']),
  ('b0000000-0000-4000-8000-000000000004', 'Mobile Developer', array['Flutter', 'Dart']),
  ('b0000000-0000-4000-8000-000000000004', 'ML Engineer', array['TensorFlow', 'Python']),
  ('b0000000-0000-4000-8000-000000000005', 'Game Developer', array['Three.js', 'WebGL']),
  ('b0000000-0000-4000-8000-000000000005', 'Backend Developer', array['Node.js', 'Socket.io']),
  ('b0000000-0000-4000-8000-000000000006', 'Fullstack Developer', array['Next.js', 'Prisma']),
  ('b0000000-0000-4000-8000-000000000006', 'Content Creator', array['Writing', 'Video'])
) as vs(project_id, title, skills) on vs.project_id::uuid = v.project_id and vs.title = v.title
cross join lateral unnest(vs.skills) as skill_name
join skills s on s.name = skill_name;
