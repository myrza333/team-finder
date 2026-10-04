import type { Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";

// Даты с сервера приходят как ISO-строки ("2026-09-29T10:05:00Z"), показываем их по-человечески на языке сайта.
// Названия месяцев берём из словаря, а не из Intl: в браузерах нет полных данных для кыргызского

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const daysAgo = (date: Date) => Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY);

// "Sep 20" / "20 сент." / "20-сен.", год — только если не текущий
const shortDate = (d: Date, locale: Locale) =>
  dictionaries[locale].time.dateShort(
    d.getDate(),
    d.getMonth(),
    d.getFullYear() !== new Date().getFullYear() ? d.getFullYear() : undefined,
  );

// "just now", "5 minutes ago", "3 hours ago", "Yesterday", "4 days ago", "Sep 20"
export function timeAgo(iso: string, locale: Locale) {
  const t = dictionaries[locale].time;
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  if (diff < MINUTE) return t.justNow;
  if (diff < HOUR) return t.minutesAgo(Math.floor(diff / MINUTE));
  if (diff < DAY) return t.hoursAgo(Math.floor(diff / HOUR));
  const days = daysAgo(date);
  if (days === 1) return t.yesterday;
  if (days < 7) return t.daysAgo(days);
  return shortDate(date, locale);
}

export const isToday = (iso: string) => daysAgo(new Date(iso)) === 0;

// Разделитель дней в чате: "Today", "Yesterday", "Sep 20"
export function dayLabel(iso: string, locale: Locale) {
  const t = dictionaries[locale].time;
  const date = new Date(iso);
  const days = daysAgo(date);
  if (days === 0) return t.today;
  if (days === 1) return t.yesterday;
  return shortDate(date, locale);
}

// Время сообщения: "10:05" (24 часа на всех языках)
export const clockTime = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// ===== Дата запуска анонса ("2026-10-14") =====

// Сколько дней до запуска (сегодня — 0)
export const daysUntil = (date: string) => {
  const today = new Date();
  const [y, m, d] = date.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / DAY);
};

// "Launches in 10 days" / "Launches tomorrow" / "Launches today"
export const launchCountdown = (date: string, locale: Locale) => {
  const t = dictionaries[locale].time;
  const days = daysUntil(date);
  if (days <= 0) return t.launchToday;
  if (days === 1) return t.launchTomorrow;
  return t.launchIn(days);
};

// "October 14" / "14 октября" / "14-октябрь"
export const launchDate = (date: string, locale: Locale) => {
  const [, m, d] = date.split("-").map(Number);
  return dictionaries[locale].time.dateLong(d, m - 1);
};
