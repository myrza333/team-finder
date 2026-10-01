// Даты с сервера приходят как ISO-строки ("2026-09-29T10:05:00Z"), показываем их по-человечески

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// "Sep 20" или "Sep 20, 2025", если год не текущий
const shortDate = (d: Date) =>
  d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== new Date().getFullYear() && { year: "numeric" }),
  });

// "just now", "5 minutes ago", "3 hours ago", "Yesterday", "4 days ago", "Sep 20"
export function timeAgo(iso: string) {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return plural(Math.floor(diff / MINUTE), "minute") + " ago";
  if (diff < DAY) return plural(Math.floor(diff / HOUR), "hour") + " ago";
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return shortDate(date);
}

// Разделитель дней в чате: "Today", "Yesterday", "Sep 20"
export function dayLabel(iso: string) {
  const date = new Date(iso);
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return shortDate(date);
}

// Время сообщения: "10:05"
export const clockTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// ===== Дата запуска анонса ("2026-10-14") =====

// Сколько дней до запуска (сегодня — 0)
export const daysUntil = (date: string) => {
  const today = new Date();
  const [y, m, d] = date.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / DAY);
};

// "Launches in 10 days" / "Launches tomorrow" / "Launches today"
export const launchCountdown = (date: string) => {
  const days = daysUntil(date);
  if (days <= 0) return "Launches today";
  if (days === 1) return "Launches tomorrow";
  return `Launches in ${plural(days, "day")}`;
};

// "October 14"
export const launchDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" });
