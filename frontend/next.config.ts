import path from "node:path";
import type { NextConfig } from "next";

if (process.env.VERCEL && !process.env.BACKEND_URL) {
  throw new Error("BACKEND_URL is not set. Add it in Vercel → Settings → Environment Variables and redeploy.");
}

const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:5000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  sassOptions: {
    // В каждом .scss доступны миксины из src/styles/_mixins.scss без ручного импорта
    loadPaths: [path.join(process.cwd(), "src/styles")],
    additionalData: `@use "mixins" as *;`,
  },
  // Браузер ходит на /api этого же домена, а Next пересылает запрос на бэкенд.
  // Так cookie сессии — "своя" для сайта, и вход работает, даже когда фронт и бэк на разных доменах.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
