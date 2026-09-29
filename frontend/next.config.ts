import path from "node:path";
import type { NextConfig } from "next";

import { BACKEND_URL } from "./src/lib/backendUrl";

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
