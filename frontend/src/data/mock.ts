// Временные данные для вёрстки. Позже заменятся запросами к API.
import type { Application, AppNotification, Project, ProjectCategory, User } from "@/types";

const avatar = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

export const users: User[] = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    name: "Timur Akmatov",
    title: "Junior Frontend Developer",
    avatarUrl: avatar("Timur"),
    skills: ["React", "TypeScript", "Next.js", "SCSS", "Node.js"],
    projectsCount: 4,
    teamsCount: 3,
    contributionsCount: 12,
    bio: "Passionate frontend developer with a love for clean UI and modern web technologies.",
    location: "Bishkek, Kyrgyzstan",
    githubUrl: "https://github.com/timur-akmatov",
    telegramUrl: "https://t.me/timur_ak",
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    name: "Aida Bekova",
    title: "UI/UX Designer",
    avatarUrl: avatar("Aida"),
    skills: ["Figma", "Prototyping", "Design Systems"],
    projectsCount: 6,
    teamsCount: 4,
    contributionsCount: 21,
    bio: "Product designer focused on simple, accessible interfaces and design systems.",
    location: "Almaty, Kazakhstan",
    githubUrl: "https://github.com/aidabekova",
    telegramUrl: "https://t.me/aida_design",
  },
  {
    id: "a0000000-0000-4000-8000-000000000003",
    name: "Bek Osorov",
    title: "Backend Developer",
    avatarUrl: avatar("Bek"),
    skills: ["Node.js", "PostgreSQL", "Docker"],
    projectsCount: 3,
    teamsCount: 2,
    contributionsCount: 9,
    telegramUrl: "https://t.me/bek_osorov",
  },
  {
    id: "a0000000-0000-4000-8000-000000000004",
    name: "Alina Dzhaksybekova",
    title: "Mobile Developer",
    avatarUrl: avatar("Alina"),
    skills: ["React Native", "Flutter", "Swift"],
    projectsCount: 5,
  },
  {
    id: "a0000000-0000-4000-8000-000000000005",
    name: "Daniyar Seitov",
    title: "AI/ML Engineer",
    avatarUrl: avatar("Daniyar"),
    skills: ["Python", "PyTorch", "LangChain"],
    projectsCount: 7,
  },
  {
    id: "a0000000-0000-4000-8000-000000000006",
    name: "Kamila Nurova",
    title: "DevOps Engineer",
    avatarUrl: avatar("Kamila"),
    skills: ["Kubernetes", "AWS", "CI/CD"],
    projectsCount: 2,
  },
];

// Текущий залогиненный пользователь (пока всегда Timur)
export const currentUser = users[0];

export const projectCategories: ProjectCategory[] = [
  "Development",
  "Design",
  "AI",
  "Startup",
  "Education",
  "Games",
  "Mobile",
];

const [timur, aida, bek, alina, daniyar, kamila] = users;

export const projects: Project[] = [
  {
    id: "b0000000-0000-4000-8000-000000000001",
    title: "AI Study Platform",
    description: "An adaptive learning platform that uses AI to personalize study plans for students.",
    fullDescription:
      "We are building an AI-powered study platform that adapts to each student's learning style and pace. The platform analyzes performance data to generate personalized content, quizzes, and study schedules.",
    icon: "🎓",
    category: "AI",
    stack: ["React", "Node.js", "PostgreSQL"],
    vacancies: [
      { id: "v1", title: "Frontend Developer", skills: ["React", "TypeScript"] },
      { id: "v2", title: "UI/UX Designer", skills: ["Figma", "Prototyping"] },
    ],
    owner: timur,
    members: [timur, aida, bek],
    status: "open",
  },
  {
    id: "b0000000-0000-4000-8000-000000000002",
    title: "EcoTracker",
    description: "A mobile app for tracking personal carbon footprint and finding eco-friendly alternatives.",
    fullDescription:
      "EcoTracker helps individuals and families understand and reduce their carbon footprint through daily tracking, gamification, and community challenges.",
    icon: "🌱",
    category: "Mobile",
    stack: ["React Native", "Python", "MongoDB"],
    vacancies: [
      { id: "v3", title: "Backend Developer", skills: ["Python", "MongoDB"] },
      { id: "v4", title: "Data Scientist", skills: ["Python", "Pandas"] },
    ],
    owner: alina,
    members: [alina, daniyar],
    status: "open",
  },
  {
    id: "b0000000-0000-4000-8000-000000000003",
    title: "DevConnect",
    description: "Real-time collaboration tool for distributed development teams with built-in code review.",
    fullDescription:
      "DevConnect is a collaboration platform that brings code review, pair programming, and team communication into one unified workspace for remote teams.",
    icon: "💻",
    category: "Development",
    stack: ["Vue.js", "Go", "Redis"],
    vacancies: [
      { id: "v5", title: "Frontend Developer", skills: ["Vue.js", "TypeScript"] },
      { id: "v6", title: "DevOps Engineer", skills: ["Docker", "CI/CD"] },
    ],
    owner: aida,
    members: [aida, kamila],
    status: "open",
  },
  {
    id: "b0000000-0000-4000-8000-000000000004",
    title: "HealthMate",
    description: "AI-powered health monitoring app that connects patients with specialists.",
    fullDescription:
      "HealthMate uses machine learning to analyze health metrics and provide early warnings for potential health issues, connecting users with appropriate medical professionals.",
    icon: "❤️",
    category: "AI",
    stack: ["Flutter", "FastAPI", "TensorFlow"],
    vacancies: [
      { id: "v7", title: "Mobile Developer", skills: ["Flutter", "Dart"] },
      { id: "v8", title: "ML Engineer", skills: ["TensorFlow", "Python"] },
    ],
    owner: bek,
    members: [bek, daniyar, timur],
    status: "open",
  },
  {
    id: "b0000000-0000-4000-8000-000000000005",
    title: "GameVerse",
    description: "Multiplayer browser game platform with real-time leaderboards and tournaments.",
    fullDescription:
      "GameVerse is a browser-based gaming platform where indie developers can publish their games and players can compete in real-time tournaments with friends.",
    icon: "🎮",
    category: "Games",
    stack: ["Three.js", "Socket.io", "PostgreSQL"],
    vacancies: [
      { id: "v9", title: "Game Developer", skills: ["Three.js", "WebGL"] },
      { id: "v10", title: "Backend Developer", skills: ["Node.js", "Socket.io"] },
    ],
    owner: kamila,
    members: [kamila, alina],
    status: "open",
  },
  {
    id: "b0000000-0000-4000-8000-000000000006",
    title: "LearnFlow",
    description: "Interactive coding bootcamp platform with live mentoring sessions.",
    fullDescription:
      "LearnFlow provides structured learning paths for aspiring developers with live coding sessions, real projects, and mentor support throughout the journey.",
    icon: "📚",
    category: "Education",
    stack: ["Next.js", "Prisma", "WebRTC"],
    vacancies: [
      { id: "v11", title: "Fullstack Developer", skills: ["Next.js", "Prisma"] },
      { id: "v12", title: "Content Creator", skills: ["Writing", "Video"] },
    ],
    owner: timur,
    members: [timur, aida],
    status: "open",
  },
];

export const getProjectById = (id: string) => projects.find((p) => p.id === id);
export const getUserById = (id: string) => users.find((u) => u.id === id);
export const getProjectsByUser = (userId: string) =>
  projects.filter((p) => p.members.some((m) => m.id === userId));

export const notifications: AppNotification[] = [
  { id: "1", actor: aida, text: "applied to your project AI Study Platform", href: "/projects/b0000000-0000-4000-8000-000000000001", time: "10 minutes ago", read: false },
  { id: "2", actor: bek, text: "joined the AI Study Platform team", href: "/projects/b0000000-0000-4000-8000-000000000001", time: "1 hour ago", read: false },
  { id: "3", actor: alina, text: "liked your profile", href: "/profile/a0000000-0000-4000-8000-000000000004", time: "3 hours ago", read: true },
  { id: "4", actor: daniyar, text: "commented on DevConnect project", href: "/projects/b0000000-0000-4000-8000-000000000003", time: "Yesterday", read: true },
  { id: "5", actor: kamila, text: "sent you a message", href: "/profile/a0000000-0000-4000-8000-000000000006", time: "2 days ago", read: true },
];

// Все навыки для подсказок (в базе — таблица skills)
export const allSkills = [
  "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "HTML/CSS", "SCSS",
  "Node.js", "NestJS", "Express", "Python", "Django", "FastAPI", "Go", "Java", "C#",
  "PHP", "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Figma",
  "UI/UX", "Prototyping", "Swift", "Kotlin", "Flutter", "React Native", "Machine Learning",
  "PyTorch", "TensorFlow", "DevOps", "CI/CD", "QA",
];


// ===== Поиск (потом заменится запросами к API) =====
const includes = (text: string, q: string) => text.toLowerCase().includes(q);

// Проект: название, описание, стек, вакансии
export const matchProject = (p: Project, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    includes(p.title, q) ||
    includes(p.description, q) ||
    p.stack.some((s) => includes(s, q)) ||
    p.vacancies.some((v) => includes(v.title, q))
  );
};

// Человек: имя, должность, навыки
export const matchUser = (u: User, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return includes(u.name, q) || includes(u.title, q) || u.skills.some((s) => includes(s, q));
};

// ===== Заявки =====
const [p1, p2, p3, p4, p5, p6] = projects;
const vacancy = (p: Project, title: string) => p.vacancies.find((v) => v.title === title) ?? null;

// Входящие: заявки на проекты текущего пользователя (AI Study Platform, LearnFlow)
export const receivedApplications: Application[] = [
  {
    id: "r1",
    project: p1,
    vacancy: vacancy(p1, "Frontend Developer"),
    applicant: kamila,
    message: "Hi! I have 2 years of experience with React and TypeScript and would love to help build the frontend.",
    status: "pending",
    createdAt: "2 hours ago",
  },
  {
    id: "r2",
    project: p1,
    vacancy: vacancy(p1, "UI/UX Designer"),
    applicant: alina,
    message: "I'm a mobile developer, but I also design in Figma. Happy to help with the design system.",
    status: "pending",
    createdAt: "Yesterday",
  },
  {
    id: "r3",
    project: p6,
    vacancy: vacancy(p6, "Fullstack Developer"),
    applicant: bek,
    message: "Fullstack with Node.js and PostgreSQL. I can start this week and spend ~10 hours per week.",
    status: "pending",
    createdAt: "2 days ago",
  },
  {
    id: "r4",
    project: p1,
    vacancy: vacancy(p1, "UI/UX Designer"),
    applicant: aida,
    message: "Love the idea! I've designed two edtech products before.",
    status: "accepted",
    createdAt: "Sep 10, 2026",
  },
  {
    id: "r5",
    project: p6,
    vacancy: vacancy(p6, "Content Creator"),
    applicant: daniyar,
    status: "rejected",
    createdAt: "Sep 8, 2026",
  },
];

// Отправленные: заявки текущего пользователя в чужие проекты
export const sentApplications: Application[] = [
  { id: "s4", project: p2, vacancy: vacancy(p2, "Backend Developer"), applicant: timur, status: "pending", createdAt: "Sep 20, 2026" },
  { id: "s1", project: p3, vacancy: vacancy(p3, "Frontend Developer"), applicant: timur, status: "pending", createdAt: "Sep 18, 2026" },
  { id: "s2", project: p4, vacancy: vacancy(p4, "Mobile Developer"), applicant: timur, status: "accepted", createdAt: "Sep 15, 2026" },
  { id: "s3", project: p5, vacancy: vacancy(p5, "Backend Developer"), applicant: timur, status: "rejected", createdAt: "Sep 10, 2026" },
];

export const getOwnedProjects = (userId: string) => projects.filter((p) => p.owner.id === userId);
export const getJoinedProjects = (userId: string) =>
  projects.filter((p) => p.owner.id !== userId && p.members.some((m) => m.id === userId));
export const pendingCount = (projectId?: string) =>
  receivedApplications.filter((a) => a.status === "pending" && (!projectId || a.project.id === projectId)).length;
