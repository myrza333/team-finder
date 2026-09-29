import type { Project, ProjectCategory, User } from "@/types";
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
  stack: string[];
  vacancies: { title: string; skills?: string[]; isOpen?: boolean }[];
};

export type ProfileInput = Partial<{
  name: string;
  title: string;
  bio: string;
  location: string;
  avatarUrl: string;
  githubUrl: string;
  telegramUrl: string;
  skills: string[];
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
        "Content-Type": "application/json",
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
    },
    users: {
      list: (query: { q?: string; role?: string; limit?: number } = {}) => request<User[]>("/users", { query }),
      get: (id: string) => request<User>(`/users/${id}`),
      me: () => request<User>("/users/me"),
      updateMe: (data: ProfileInput) => request<User>("/users/me", { method: "PATCH", body: json(data) }),
      removeMe: () => request<void>("/users/me", { method: "DELETE" }),
    },
    skills: () => request<string[]>("/skills"),
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
