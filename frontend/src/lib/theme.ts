// Выбранная вручную тема хранится в cookie: сервер читает её в app/layout.tsx и сразу отдаёт
// <html data-theme="...">. Так нет ни вспышки светлой темы, ни скрипта в <head>.
// Нет cookie — действует системная тема (prefers-color-scheme в globals.scss)
export const THEME_COOKIE = "tf-theme";

export type Theme = "light" | "dark";

export const parseTheme = (value: string | undefined): Theme | undefined =>
  value === "light" || value === "dark" ? value : undefined;
