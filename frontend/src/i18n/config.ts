// Языки сайта. Выбранный хранится в cookie (Settings → Language): сервер читает её в app/layout.tsx
// и сразу отдаёт страницу на нужном языке. Нет cookie — английский
export const locales = ["en", "ru", "ky"] as const;

export type Locale = (typeof locales)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "tf-lang";

export const parseLocale = (value: string | null | undefined): Locale =>
  locales.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;

// Название языка на нём самом — его узнают, даже если сайт сейчас на непонятном языке
export const localeNames: Record<Locale, string> = { en: "English", ru: "Русский", ky: "Кыргызча" };
