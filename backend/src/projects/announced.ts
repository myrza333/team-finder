// Проект с датой запуска в будущем — анонс. Пока он не запущен, посторонним видны только
// название, короткое описание, иконка, категория, владелец и дата. Команда, стек, вакансии,
// полное описание и репозиторий — "засекречены" до запуска. Владелец видит всё

type ProjectShape = {
  announced: boolean;
  owner: { id: string };
  members: { id: string }[];
  [key: string]: unknown;
};

// SQL-условие "проект уже запущен" (для списков, где анонсам не место)
export const launchedSql = (p: string) => `(${p}.launch_at is null or ${p}.launch_at <= current_date)`;

export const hideUnlaunched = <T>(project: T, viewerId?: string): T => {
  const p = project as unknown as ProjectShape;
  if (!p.announced || p.owner.id === viewerId) return project;
  return {
    ...p,
    fullDescription: '',
    stack: [],
    vacancies: [],
    repoUrl: null,
    members: p.members.filter((m) => m.id === p.owner.id),
  } as T;
};
