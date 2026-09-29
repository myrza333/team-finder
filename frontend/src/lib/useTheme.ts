"use client";
import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "./theme";

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

  const setPreference = (next: ThemePreference) => {
    const root = document.documentElement;
    try {
      if (next === "system") {
        delete root.dataset.theme;
        localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        root.dataset.theme = next;
        localStorage.setItem(THEME_STORAGE_KEY, next);
      }
    } catch {}
  };

  return { preference, setPreference };
};
