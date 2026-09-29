import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, createApi } from "./api";
import { SESSION_COOKIE } from "./session";

// API для серверных компонентов: пробрасывает cookie сессии из запроса браузера
export const serverApi = createApi(async (): Promise<Record<string, string>> => {
  const session = (await cookies()).get(SESSION_COOKIE);
  return session ? { Cookie: `${SESSION_COOKIE}=${session.value}` } : {};
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
