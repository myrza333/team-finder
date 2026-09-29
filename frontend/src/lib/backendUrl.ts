// Адрес NestJS-бэкенда (без /api). Можно переопределить переменной BACKEND_URL.
// На Vercel по умолчанию — наш бэкенд на Render, локально — localhost.
const PRODUCTION_BACKEND = "https://teamfinder-j1r7.onrender.com";

export const BACKEND_URL = (
  process.env.BACKEND_URL || (process.env.VERCEL ? PRODUCTION_BACKEND : "http://localhost:5000")
).replace(/\/+$/, "");
