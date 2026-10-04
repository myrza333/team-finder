import type {
  Announcement,
  AppNotification,
  Application,
  ApplicationStatus,
  ChatMessage,
  ChatSummary,
  LaunchSubscription,
  DirectChat,
  Project,
  ProjectCategory,
  User,
  UserSettings,
} from "@/types";
import { BACKEND_URL } from "./backendUrl";

// В браузере — /api этого же сайта (next.config.ts пересылает на бэкенд), на сервере Next — напрямую на бэкенд
const isServer = typeof window === "undefined";
const API_URL = isServer ? `${BACKEND_URL}/api` : "/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type Query = Record<string, string | number | undefined | null>;
type ExtraHeaders = () => Promise<Record<string, string>>;

export type ProjectInput = {
  title: string;
  description: string;
  fullDescription?: string;
  category: ProjectCategory;
  icon?: string;
  websiteUrl?: string; // пустая строка — убрать ссылку
  repoUrl?: string;
  launchAt?: string; // "2026-10-14"; пустая строка — запустить сразу
  stack: string[];
  // id есть у существующих позиций — тогда они обновляются, а заявки на них сохраняют роль
  vacancies: { id?: string; title: string; skills?: string[]; isOpen?: boolean }[];
};

export type ProfileInput = Partial<{
  name: string;
  title: string;
  bio: string;
  location: string;
  avatarUrl: string;
  githubUrl: string;
  telegramUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  codewarsUrl: string;
  leetcodeUrl: string;
  skills: string[];
  stacks: string[];
}>;

// getExtraHeaders нужен серверу: браузер отправляет cookie сам, а Next-серверу её надо передать вручную
export const createApi = (getExtraHeaders?: ExtraHeaders) => {
  async function request<T>(path: string, init: RequestInit & { query?: Query } = {}): Promise<T> {
    const url = new URL(API_URL + path, isServer ? undefined : window.location.origin);
    Object.entries(init.query ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
    });

    const res = await fetch(url, {
      ...init,
      cache: "no-store",
      credentials: "include",
      headers: {
        // Для FormData (загрузка файла) заголовок с границами частей браузер ставит сам
        ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(await getExtraHeaders?.()),
        ...init.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message = Array.isArray(body?.message) ? body.message.join(", ") : (body?.message ?? res.statusText);
      throw new ApiError(res.status, message);
    }
    return res.status === 204 ? (undefined as T) : res.json();
  }

  const json = (data: unknown) => JSON.stringify(data);

  return {
    auth: {
      register: (data: { name: string; email: string; password: string }) =>
        request<User>("/auth/register", { method: "POST", body: json(data) }),
      login: (data: { email: string; password: string }) =>
        request<User>("/auth/login", { method: "POST", body: json(data) }),
      logout: () => request<void>("/auth/logout", { method: "POST" }),
      me: () => request<User>("/auth/me"),
      socketToken: () => request<{ token: string }>("/auth/socket-token"),
      account: () => request<{ email: string; hasPassword: boolean; googleLinked: boolean }>("/auth/account"),
      changePassword: (data: { currentPassword?: string; newPassword: string }) =>
        request<void>("/auth/password", { method: "POST", body: json(data) }),
      unlinkGoogle: () => request<void>("/auth/google", { method: "DELETE" }),
    },
    projects: {
      list: (query: { q?: string; category?: string | null; owner?: string; member?: string; limit?: number } = {}) =>
        request<Project[]>("/projects", { query }),
      get: (id: string) => request<Project>(`/projects/${id}`),
      create: (data: ProjectInput) => request<Project>("/projects", { method: "POST", body: json(data) }),
      update: (id: string, data: Partial<ProjectInput> & { status?: "open" | "closed" }) =>
        request<Project>(`/projects/${id}`, { method: "PATCH", body: json(data) }),
      remove: (id: string) => request<void>(`/projects/${id}`, { method: "DELETE" }),
      // Команда
      leave: (id: string) => request<void>(`/projects/${id}/members/me`, { method: "DELETE" }),
      removeMember: (id: string, userId: string) =>
        request<void>(`/projects/${id}/members/${userId}`, { method: "DELETE" }),
      setVacancyOpen: (id: string, vacancyId: string, isOpen: boolean) =>
        request<{ id: string; isOpen: boolean }>(`/projects/${id}/vacancies/${vacancyId}`, {
          method: "PATCH",
          body: json({ isOpen }),
        }),
    },
    applications: {
      apply: (projectId: string, data: { vacancyId?: string; message?: string }) =>
        request<Application>(`/projects/${projectId}/applications`, { method: "POST", body: json(data) }),
      received: (query: { status?: ApplicationStatus; projectId?: string } = {}) =>
        request<Application[]>("/applications/received", { query }),
      sent: (query: { projectId?: string } = {}) => request<Application[]>("/applications/sent", { query }),
      pendingCounts: () =>
        request<{ total: number; byProject: Record<string, number> }>("/applications/pending-counts"),
      decide: (id: string, status: "accepted" | "rejected") =>
        request<Application>(`/applications/${id}`, { method: "PATCH", body: json({ status }) }),
      withdraw: (id: string) => request<void>(`/applications/${id}`, { method: "DELETE" }),
    },
    notifications: {
      list: () => request<AppNotification[]>("/notifications"),
      unreadCount: () => request<{ count: number }>("/notifications/unread-count"),
      markRead: (id: string) => request<void>(`/notifications/${id}/read`, { method: "POST" }),
      markAllRead: () => request<void>("/notifications/read-all", { method: "POST" }),
    },
    chats: {
      list: () => request<ChatSummary[]>("/chats"),
      // before — id сообщения: вернутся те, что старше него
      messages: (projectId: string, before?: string) =>
        request<ChatMessage[]>(`/chats/${projectId}/messages`, { query: { before } }),
      send: (projectId: string, text: string) =>
        request<ChatMessage>(`/chats/${projectId}/messages`, { method: "POST", body: json({ text }) }),
      markRead: (projectId: string) => request<void>(`/chats/${projectId}/read`, { method: "POST" }),
    },
    // Личные чаты по поводу проекта. open* возвращают id чата (существующего или нового)
    direct: {
      openWithOwner: (projectId: string) =>
        request<{ id: string }>(`/projects/${projectId}/direct`, { method: "POST" }),
      openWithApplicant: (applicationId: string) =>
        request<{ id: string }>(`/applications/${applicationId}/direct`, { method: "POST" }),
      list: () => request<DirectChat[]>("/direct"),
      messages: (chatId: string, before?: string) =>
        request<ChatMessage[]>(`/direct/${chatId}/messages`, { query: { before } }),
      send: (chatId: string, text: string) =>
        request<ChatMessage>(`/direct/${chatId}/messages`, { method: "POST", body: json({ text }) }),
      markRead: (chatId: string) => request<void>(`/direct/${chatId}/read`, { method: "POST" }),
    },
    users: {
      list: (query: { q?: string; role?: string; limit?: number } = {}) => request<User[]>("/users", { query }),
      get: (id: string) => request<User>(`/users/${id}`),
      me: () => request<User>("/users/me"),
      updateMe: (data: ProfileInput) => request<User>("/users/me", { method: "PATCH", body: json(data) }),
      removeMe: () => request<void>("/users/me", { method: "DELETE" }),
      uploadAvatar: (image: Blob) => {
        const body = new FormData();
        body.append("file", image, "avatar.jpg");
        return request<User>("/users/me/avatar", { method: "PUT", body });
      },
      removeAvatar: () => request<User>("/users/me/avatar", { method: "DELETE" }),
      settings: () => request<UserSettings>("/users/me/settings"),
      updateSettings: (data: Partial<UserSettings>) =>
        request<UserSettings>("/users/me/settings", { method: "PATCH", body: json(data) }),
    },
    skills: () => request<string[]>("/skills"),
    // Анонсы: limit 3 — для главной, без limit — все (страница Announcements)
    announcements: (limit?: number) => request<Announcement[]>("/announcements", { query: { limit } }),
    // "Notify me" на анонсе
    launch: {
      subscription: (projectId: string) => request<LaunchSubscription>(`/projects/${projectId}/notify-me`),
      subscribe: (projectId: string) =>
        request<LaunchSubscription>(`/projects/${projectId}/notify-me`, { method: "POST" }),
      unsubscribe: (projectId: string) =>
        request<LaunchSubscription>(`/projects/${projectId}/notify-me`, { method: "DELETE" }),
    },
  };
};

export const api = createApi();

// Вход через Google — это переход страницы (не fetch): бэкенд уводит на Google и потом возвращает обратно
export const googleAuthUrl = (next = "/") => `/api/auth/google?next=${encodeURIComponent(next)}`;

export const authErrorMessages: Record<string, string> = {
  google_failed: "Couldn't sign in with Google. Please try again.",
  google_not_configured: "Google sign-in isn't set up yet.",
  google_taken: "This Google account is already linked to another TeamFinder account.",
  google_unverified: "Your Google email isn't verified, so we can't link it to an existing account.",
};

// 404 → null, чтобы страница могла вызвать notFound()
export async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
