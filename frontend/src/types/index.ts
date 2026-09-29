export type User = {
  id: string;
  name: string;
  title: string; // "Junior Frontend Developer"
  avatarUrl: string;
  skills: string[];
  projectsCount: number;
  bio?: string | null;
  location?: string | null;
  githubUrl?: string | null;
  telegramUrl?: string | null;
  teamsCount?: number;
  contributionsCount?: number;
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

export type AppNotification = {
  id: string;
  actor: User; // кто совершил действие
  text: string; // "applied to your project AI Study Platform"
  href: string; // куда ведёт клик
  time: string;
  read: boolean;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  icon: string;
  category: ProjectCategory;
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
  message?: string;
  status: ApplicationStatus;
  createdAt: string; // пока готовая строка для показа, потом — дата из API
};

// Сообщение в чате команды. author = null — системное ("Aida joined the team")
export type ChatMessage = {
  id: string;
  author: User | null;
  text: string;
  day: string; // "Today", "Yesterday", "Sep 20" — для разделителей по дням
  time: string; // "10:05"
};
