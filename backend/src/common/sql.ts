// Postgres сам собирает JSON в той форме, которую ждёт фронтенд (camelCase, вложенные массивы)

// Своё фото или нарисованная аватарка по имени
const avatarUrl = (u: string) => `coalesce(${u}.avatar_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || ${u}.name)`;

export const userJson = (u: string) => `json_build_object(
  'id', ${u}.id,
  'name', ${u}.name,
  'title', coalesce(${u}.title, ''),
  'avatarUrl', ${avatarUrl(u)},
  'bio', ${u}.bio,
  'location', ${u}.location,
  'githubUrl', ${u}.github_url,
  'telegramUrl', ${u}.telegram_url,
  'skills', coalesce((
    select json_agg(s.name order by s.name)
    from user_skills us join skills s on s.id = us.skill_id
    where us.user_id = ${u}.id
  ), '[]'),
  'projectsCount', (select count(*) from project_members pm where pm.user_id = ${u}.id)::int
)`;

// Короткая карточка человека: для чата и уведомлений навыки и счётчики не нужны
export const personJson = (u: string) => `json_build_object(
  'id', ${u}.id,
  'name', ${u}.name,
  'title', coalesce(${u}.title, ''),
  'avatarUrl', ${avatarUrl(u)}
)`;

// Сообщение чата; a — автор (left join, у системных сообщений автора нет)
export const messageJson = (m: string, a: string) => `json_build_object(
  'id', ${m}.id::text,
  'projectId', ${m}.project_id,
  'text', ${m}.text,
  'createdAt', ${m}.created_at,
  'author', case when ${a}.id is null then null else ${personJson(a)} end
)`;

export const projectJson = (p: string) => `json_build_object(
  'id', ${p}.id,
  'title', ${p}.title,
  'description', ${p}.description,
  'fullDescription', ${p}.full_description,
  'icon', ${p}.icon,
  'category', ${p}.category,
  'status', ${p}.status,
  'createdAt', ${p}.created_at,
  'owner', (select ${userJson('o')} from users o where o.id = ${p}.owner_id),
  'stack', coalesce((
    select json_agg(s.name order by s.name)
    from project_skills ps join skills s on s.id = ps.skill_id
    where ps.project_id = ${p}.id
  ), '[]'),
  'vacancies', coalesce((
    select json_agg(json_build_object(
      'id', v.id,
      'title', v.title,
      'isOpen', v.is_open,
      'skills', coalesce((
        select json_agg(s.name order by s.name)
        from vacancy_skills vs join skills s on s.id = vs.skill_id
        where vs.vacancy_id = v.id
      ), '[]')
    ) order by v.position)
    from vacancies v where v.project_id = ${p}.id
  ), '[]'),
  'members', coalesce((
    select json_agg(${userJson('mu')} order by pm.user_id = ${p}.owner_id desc, pm.joined_at)
    from project_members pm join users mu on mu.id = pm.user_id
    where pm.project_id = ${p}.id
  ), '[]')
)`;
