"use client";
import { Globe } from "lucide-react";
import { useI18n, useSetLocale } from "@/i18n/client";
import { localeNames, locales } from "@/i18n/config";
import scss from "./LanguageSwitcher.module.scss";

// Быстрая смена языка в футере и на страницах входа — доступна и гостям (Settings → Language только после входа)
const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { t, locale } = useI18n();
  const { setLocale, pending } = useSetLocale();

  return (
    <div className={`${scss.switcher} ${className ?? ""}`} role="group" aria-label={t.settings.language.title}>
      <Globe size={14} strokeWidth={1.75} className={scss.icon} aria-hidden />
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={code === locale}
          disabled={pending}
          onClick={() => code !== locale && setLocale(code)}
          className={`${scss.option} ${code === locale ? scss.active : ""}`}
        >
          {localeNames[code]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
