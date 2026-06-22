import type { ElementType } from "react";

export type Screen =
  | "onboarding"
  | "home"
  | "all-hymns"
  | "search"
  | "categories"
  | "category-detail"
  | "favorites"
  | "settings"
  | "hymn-detail";

export type Language = "en" | "yo";
export type ApiLanguage = "english" | "yoruba";
export type HymnType = "regular" | "various";
export type Tab = "home" | "search" | "categories" | "favorites" | "settings";
export type SettingsLanguage = "en" | "yo" | "auto";

export interface Verse {
  number: number;
  en: string[];
  yo: string[];
}

export interface HymnSummary {
  id: number;
  number: number;
  hymnType: HymnType;

  titleEn: string;
  titleYo: string;

  category: string;
  categoryEn: string;
  categoryYo: string;

  meter?: string | null;
  scripture?: string | null;
  author?: string;
}

export interface Hymn extends HymnSummary {
  verses: Verse[];
  chorus?: {
    en: string[];
    yo: string[];
  };
}

export interface CategoryDef {
  id: string;
  nameEn: string;
  nameYo: string;
  Icon: ElementType;
  hymnCount: number;
  color: string;
  bg: string;
}

export interface CachedValue<T> {
  savedAt: number;
  data: T;
}