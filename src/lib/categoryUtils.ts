import {
  BookOpen,
  ChevronRight,
  Heart,
  Moon,
  Music,
  Star,
  Sun,
} from "lucide-react";

import type { CategoryDef, HymnSummary } from "../types/hymnal";

const CATEGORY_STYLES = [
  { Icon: Star, color: "#B8860B", bg: "#FDF3DC" },
  { Icon: Music, color: "#1A237E", bg: "#E8EAFB" },
  { Icon: Heart, color: "#2E7D32", bg: "#E8F5E9" },
  { Icon: BookOpen, color: "#6A1B9A", bg: "#F3E5F5" },
  { Icon: ChevronRight, color: "#C62828", bg: "#FFEBEE" },
  { Icon: Sun, color: "#E65100", bg: "#FBE9E7" },
  { Icon: Moon, color: "#37474F", bg: "#ECEFF1" },
];

export function buildCategoriesFromHymns(
  hymns: HymnSummary[]
): CategoryDef[] {
  const grouped = new Map<string, HymnSummary[]>();

  hymns.forEach((hymn) => {
    const current = grouped.get(hymn.category) ?? [];
    current.push(hymn);
    grouped.set(hymn.category, current);
  });

  return Array.from(grouped.entries())
    .map(([id, items], index) => {
      const first = items[0];
      const style = CATEGORY_STYLES[index % CATEGORY_STYLES.length];

      return {
        id,
        nameEn: first.categoryEn,
        nameYo: first.categoryYo,
        hymnCount: items.length,
        Icon: style.Icon,
        color: style.color,
        bg: style.bg,
      };
    })
    .sort((a, b) => a.nameEn.localeCompare(b.nameEn));
}