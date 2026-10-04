import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocale } from "./config";
import { dictionaries } from "./dictionaries";

// Для серверных компонентов: язык из cookie и его словарь
export async function getI18n() {
  const locale = parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  return { locale, t: dictionaries[locale] };
}
