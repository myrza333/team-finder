"use client";
import { useSyncExternalStore } from "react";
import { THEME_COOKIE } from "./theme";

export type ThemePreference = "light" | "dark" | "system";

const media = () => window.matchMedia("(prefers-color-scheme: dark)");

// data-theme есть только при ручном выборе; без него действует системная тема
const readPreference = (): ThemePreference => {
  const explicit = document.documentElement.dataset.theme;
  return explicit === "light" || explicit === "dark" ? explicit : "system";
};

const subscribe = (listener: () => void) => {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const mq = media();
  mq.addEventListener("change", listener);
  return () => {
    observer.disconnect();
    mq.removeEventListener("change", listener);
  };
};

export const useTheme = () => {
  const preference = useSyncExternalStore<ThemePreference | null>(subscribe, readPreference, () => null);

  // Меняем тему на странице сразу и запоминаем в cookie на год — сервер отдаст её при следующей загрузке
  const setPreference = (next: ThemePreference) => {
    const root = document.documentElement;
    if (next === "system") {
      delete root.dataset.theme;
      document.cookie = `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`;
    } else {
      root.dataset.theme = next;
      document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    }
  };

  return { preference, setPreference };
};
