import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// Для гостей открыты: главная, списки Projects/People, поиск, Privacy/Terms.
// Всё из matcher ниже требует входа. Здесь проверяется только наличие cookie —
// подлинность токена проверяет бэкенд на каждом запросе.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    if (!hasSession) return NextResponse.next();
    const next = request.nextUrl.searchParams.get("next");
    return NextResponse.redirect(new URL(next?.startsWith("/") ? next : "/", request.url));
  }

  if (!hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/projects/:path+",
    "/profile/:path*",
    "/notifications",
    "/chat/:path*",
    "/settings/:path*",
    "/my-projects/:path*",
    "/applications",
  ],
};
