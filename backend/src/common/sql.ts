// Postgres сам собирает JSON в той форме, которую ждёт фронтенд (camelCase, вложенные массивы)

// Фото: загруженное или из Google. Нет фото — null, и фронтенд рисует нейтральный силуэт
const avatarUrl = (u: string) => `${u}.avatar_url`;

// Публичный профиль учитывает настройки приватности (Settings → Privacy): скрытые ссылки и город — null.
// own = true — для самого человека (его настройки профиля): там нужны все значения
export const userJson = (u: string, own = false) => {
  const shown = (flag: string, column: string) => (own ? `${u}.${column}` : `case when ${u}.${flag} then ${u}.${column} end`);
  return `json_build_object(
  'id', ${u}.id,
  'name', ${u}.name,
  'title', coalesce(${u}.title, ''),
  'avatarUrl', ${avatarUrl(u)},
  'bio', ${u}.bio,
  'location', ${shown('show_location', 'location')},
  'githubUrl', ${shown('show_github', 'github_url')},
  'telegramUrl', ${shown('show_telegram', 'telegram_url')},
  'linkedinUrl', ${shown('show_socials', 'linkedin_url')},
  'instagramUrl', ${shown('show_socials', 'instagram_url')},
  'codewarsUrl', ${shown('show_socials', 'codewars_url')},
  'leetcodeUrl', ${shown('show_socials', 'leetcode_url')},
  'openToProjects', ${u}.open_to_projects,
  'skills', coalesce((
    select json_agg(s.name order by s.name)
    from user_skills us join skills s on s.id = us.skill_id
    where us.user_id = ${u}.id
  ), '[]'),
  'projectsCount', (select count(*) from project_members pm where pm.user_id = ${u}.id)::int
)`;
};

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
  'launchAt', to_char(${p}.launch_at, 'YYYY-MM-DD'),
  'announced', coalesce(${p}.launch_at > current_date, false),
  'websiteUrl', ${p}.website_url,
  'repoUrl', ${p}.repo_url,
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
