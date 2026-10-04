import type { Locale } from "../config";
import { en, type Dictionary } from "./en";
import { ky } from "./ky";
import { ru } from "./ru";

export type { Dictionary };

export const dictionaries: Record<Locale, Dictionary> = { en, ru, ky };
