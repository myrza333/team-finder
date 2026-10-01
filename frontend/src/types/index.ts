export type User = {
  id: string;
  name: string;
  title: string; // "Junior Frontend Developer"
  avatarUrl: string | null; // null — фото нет (рисуется нейтральный силуэт)
  skills: string[];
  projectsCount: number;
  bio?: string | null;
  location?: string | null;
  githubUrl?: string | null;
  telegramUrl?: string | null;
  teamsCount?: number;
  contributionsCount?: number;
  openToProjects?: boolean; // значок "Open to projects" (Settings → Privacy)
};

export type ProjectCategory =
  | "Development"
  | "Design"
  | "AI"
  | "Startup"
  | "Education"
  | "Games"
  | "Mobile";

export type Vacancy = {
  id: string;
  title: string; // "Frontend Developer"
  skills: string[];
  isOpen?: boolean;
};

// Короткая карточка человека (в чате и уведомлениях навыки не нужны)
export type Person = Pick<User, "id" | "name" | "title" | "avatarUrl">;

export type AppNotification = {
  id: string;
  actor: Person; // кто совершил действие
  text: string; // "applied to your project AI Study Platform"
  href: string; // куда ведёт клик
  createdAt: string; // ISO-дата
  read: boolean;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  icon: string;
  category: ProjectCategory;
  websiteUrl?: string | null; // сам сайт / приложение
  repoUrl?: string | null; // исходный код (GitHub, GitLab)
  stack: string[];
  vacancies: Vacancy[];
  owner: User;
  members: User[];
  status: "open" | "closed";
  createdAt?: string;
};

export type ApplicationStatus = "pending" | "accepted" | "rejected";

// Заявка "Хочу присоединиться"
export type Application = {
  id: string;
  project: Project;
  vacancy: Vacancy | null; // на какую роль подался (может быть без роли)
  applicant: User;
  message: string | null;
  status: ApplicationStatus;
  createdAt: string; // ISO-дата
};

// Сообщение в чате команды. author = null — системное ("Aida joined the team")
export type ChatMessage = {
  id: string;
  projectId?: string; // сообщение командного чата
  chatId?: string; // сообщение личного чата
  author: Person | null;
  text: string;
  createdAt: string; // ISO-дата
};

// Личный чат "по поводу проекта": я ↔ владелец (или владелец ↔ кандидат)
export type DirectChat = {
  id: string;
  project: { id: string; title: string; icon: string; ownerId: string };
  other: Person; // собеседник
  lastMessage: ChatMessage | null;
  unread: number;
};

// Чат в списке слева: проект + последнее сообщение + сколько непрочитанных
export type ChatSummary = {
  project: Project;
  lastMessage: ChatMessage | null;
  unread: number;
};

// Settings → Privacy и Settings → Notifications (уведомления только на сайте, писем пока нет)
export type UserSettings = {
  openToProjects: boolean;
  showInPeople: boolean;
  showGithub: boolean;
  showTelegram: boolean;
  showLocation: boolean;
  notifyApplications: boolean;
  notifyApplicationUpdates: boolean;
  notifyTeam: boolean;
  notifyDirect: boolean;
};

// Анонс будущего проекта на главной: команда и стек пока засекречены
export type Announcement = {
  id: string;
  title: string;
  bio: string;
  icon: string;
  startsAt: string; // "2026-10-14"
};
