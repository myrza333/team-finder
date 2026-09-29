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
