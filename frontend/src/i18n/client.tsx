"use client";
import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "./config";
import { dictionaries } from "./dictionaries";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

// locale приходит из app/layout.tsx (cookie). После смены языка router.refresh() передаёт новый
export const I18nProvider = ({ locale, children }: { locale: Locale; children: React.ReactNode }) => (
  <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
);

// Для клиентских компонентов: язык и его словарь
export const useI18n = () => {
  const locale = useContext(LocaleContext);
  return { locale, t: dictionaries[locale] };
};

// Сменить язык: запоминаем в cookie на год и перерисовываем страницу с сервера — без перезагрузки
export const useSetLocale = () => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const setLocale = (next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    document.documentElement.lang = next;
    startTransition(() => router.refresh());
  };

  return { setLocale, pending };
};
