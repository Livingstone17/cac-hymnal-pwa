import { LS_LANGUAGE } from "../constants/hymnal";
import type { Language } from "../types/hymnal";

export function loadLocal<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;

    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveLocal<T>(key: string, value: T) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors.
  }
}

export function loadLanguage(): Language {
  return loadLocal<string>(LS_LANGUAGE, "en") === "yo" ? "yo" : "en";
}

export function detectBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("yo") ? "yo" : "en";
}