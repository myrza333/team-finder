import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, createApi } from "./api";
import { SESSION_COOKIE } from "./session";

// API для серверных компонентов: пробрасывает cookie сессии и адрес посетителя из запроса браузера.
// Без адреса бэкенд считал бы все запросы с серверов Vercel одним посетителем (ограничение частоты)
export const serverApi = createApi(async (): Promise<Record<string, string>> => {
  const session = (await cookies()).get(SESSION_COOKIE);
  const forwardedFor = (await headers()).get("x-forwarded-for");
  return {
    ...(session && { Cookie: `${SESSION_COOKIE}=${session.value}` }),
    ...(forwardedFor && { "X-Forwarded-For": forwardedFor }),
  };
});

export async function getCurrentUser() {
  try {
    return await serverApi.auth.me();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
}

// Для закрытых страниц: без сессии (или с протухшей) — на страницу входа
export async function requireUser(nextPath: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}
