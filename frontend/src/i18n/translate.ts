import type { Locale } from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

// Текст ошибки с сервера (он всегда по-английски) на выбранном языке; незнакомый — как есть
export const translateError = (message: string, locale: Locale) => dictionaries[locale].apiErrors[message] ?? message;

const systemPatterns: [RegExp, keyof Dictionary["chat"]["system"]][] = [
  [/^(.+) created the project$/, "created"],
  [/^(.+) joined the team$/, "joined"],
  [/^(.+) was removed from the team$/, "removed"],
  [/^(.+) left the team$/, "left"],
];

// Системные строки чата хранятся в базе по-английски: "Aida joined the team"
export const translateSystemMessage = (text: string, t: Dictionary) => {
  for (const [pattern, key] of systemPatterns) {
    const match = text.match(pattern);
    if (match) return t.chat.system[key](match[1]);
  }
  return text;
};
