// Postgres сам собирает JSON в той форме, которую ждёт фронтенд (camelCase, вложенные массивы)

export const userJson = (u: string) => `json_build_object(
  'id', ${u}.id,
  'name', ${u}.name,
  'title', coalesce(${u}.title, ''),
  'avatarUrl', coalesce(${u}.avatar_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || ${u}.name),
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
    select json_agg(${userJson('mu')} order by pm.joined_at)
    from project_members pm join users mu on mu.id = pm.user_id
    where pm.project_id = ${p}.id
  ), '[]')
)`;
