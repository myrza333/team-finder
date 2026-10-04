import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, locales, parseLocale, type Locale } from "./config";
import { dictionaries } from "./dictionaries";

// Язык из настроек браузера ("ky-KG,ru;q=0.9,en;q=0.8") — для тех, кто ещё не выбирал язык сам
const fromAcceptLanguage = (header: string | null): Locale | undefined =>
  (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { code: tag.split("-")[0].toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q)
    .map((l) => l.code)
    .find((code): code is Locale => locales.includes(code as Locale));

// Для серверных компонентов: язык (выбранный в cookie, иначе из браузера) и его словарь
export async function getI18n() {
  const chosen = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = chosen ? parseLocale(chosen) : parseLocale(fromAcceptLanguage((await headers()).get("accept-language")));
  return { locale, t: dictionaries[locale] };
}
