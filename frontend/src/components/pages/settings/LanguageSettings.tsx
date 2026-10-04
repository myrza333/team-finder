"use client";
import { Info } from "lucide-react";
import { useState } from "react";
import { useI18n, useSetLocale } from "@/i18n/client";
import { locales, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { SettingsSection } from "./SettingsParts";
import scss from "./LanguageSettings.module.scss";

// Название языка на нём самом — его узнают, даже если сайт сейчас на непонятном языке
const nativeNames: Record<Locale, string> = { en: "English", ru: "Русский", ky: "Кыргызча" };

const LanguageSettings = () => {
  const { t, locale } = useI18n();
  const { setLocale, pending } = useSetLocale();
  // Выбранный вариант отмечаем сразу, пока страница перерисовывается на новом языке
  const [chosen, setChosen] = useState<Locale | null>(null);
  const selectedLocale = (pending && chosen) || locale;
  const l = t.settings.language;

  const choose = (next: Locale) => {
    if (next === selectedLocale) return;
    setChosen(next);
    setLocale(next);
  };

  return (
    <SettingsSection title={l.title} description={l.text}>
      <div className={scss.options} role="radiogroup" aria-label={l.title}>
        {locales.map((code) => {
          const selected = code === selectedLocale;
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={pending}
              className={`${scss.option} ${selected ? scss.selected : ""}`}
              onClick={() => choose(code)}
            >
              <div className={scss.preview} aria-hidden>
                <span className={scss.code}>{code.toUpperCase()}</span>
                <span className={scss.sample} lang={code}>
                  {dictionaries[code].home.title}
                </span>
                <span className={scss.line} />
                <span className={`${scss.line} ${scss.lineShort}`} />
              </div>

              <div className={scss.footer}>
                <span className={`${scss.code} ${scss.codeInline}`} aria-hidden>
                  {code.toUpperCase()}
                </span>
                <div className={scss.text}>
                  <p className={scss.label} lang={code}>
                    {nativeNames[code]}
                  </p>
                  <p className={scss.hint}>{code === locale ? l.current : l.names[code]}</p>
                </div>
                <span className={scss.radio} />
              </div>
            </button>
          );
        })}
      </div>

      <p className={scss.note}>
        <Info size={14} strokeWidth={1.75} aria-hidden />
        <span>{l.note}</span>
      </p>
    </SettingsSection>
  );
};

export default LanguageSettings;
