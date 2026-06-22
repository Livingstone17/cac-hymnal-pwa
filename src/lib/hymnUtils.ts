import { CACHE_PREFIX } from "../constants/hymnal";
import type { HymnSummary, HymnType } from "../types/hymnal";

export function makeHymnId(type: HymnType, number: number) {
  /**
   * API has:
   * - regular hymn 1
   * - various hymn 1
   *
   * So number alone is not unique.
   */
  return type === "regular" ? number : 100000 + number;
}

export function makeHymnKey(type: HymnType, number: number) {
  return `${type}:${number}`;
}

export function hymnCacheKey(type: HymnType, number: number) {
  return `${CACHE_PREFIX}:hymn:v1:${type}:${number}`;
}

export function displayHymnNumber(
  hymn: Pick<HymnSummary, "hymnType" | "number">
) {
  const number = hymn.number.toString().padStart(3, "0");
  return hymn.hymnType === "various" ? `V${number}` : number;
}

export function normalizeMeter(meter?: string | null) {
  return (meter ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[.,;:]/g, "")
    .trim();
}

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "uncategorized"
  );
}

export function getHymnTitle(hymn: HymnSummary, language: "en" | "yo") {
  return language === "en" ? hymn.titleEn : hymn.titleYo;
}

export function getOtherHymnTitle(hymn: HymnSummary, language: "en" | "yo") {
  return language === "en" ? hymn.titleYo : hymn.titleEn;
}

export function getHymnCategoryName(hymn: HymnSummary, language: "en" | "yo") {
  return language === "en" ? hymn.categoryEn : hymn.categoryYo;
}