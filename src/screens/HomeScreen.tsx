import React from "react";

import { Loader2, WifiOff, RefreshCw, Star, Music, Heart, ChevronRight, BookOpen, Grid3X3, Search } from "lucide-react";

import { useHymnal } from "../app/hymnalContext";

import { displayHymnNumber } from "../lib/hymnUtils";

export default function HomeScreen() {
  const {
    language,
    tr,
    hymns,
    hymnsLoading,
    hymnsError,
    loadCatalog,
    hymnOfTheDay,
    hymnOfTheDayDetail,
    hymnTitle,
    hymnOtherTitle,
    hymnCategoryName,
    recentHymns,
    favorites,
    openHymn,
    openAllHymns,
    navigateTab,
    setShowHymnOfTheDay,
    setShowCategoriesSheet,
    setShowFavoritesSheet,
  } = useHymnal();

  if (hymnsLoading && hymns.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">
            {tr(
              "Fetching your hymns for you...",
              "Ń gba iwe orin re wa fun o…"
            )}
          </p>
        </div>
      </div>
    );
  }

  if (hymnsError && hymns.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <WifiOff className="w-10 h-10 text-red-400 mb-3" />
          <p className="font-bold text-foreground mb-1">
            {tr("Connection problem", "Ìṣòro ìbánisọ̀rọ̀")}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {hymnsError}
          </p>
          <button
            onClick={() => loadCatalog({ force: true })}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {tr("Try Again", "Gbìyànjú Lẹ́ẹ̀kansi")}
          </button>
        </div>
      </div>
    );
  }

  const hymnDayLine =
    hymnOfTheDayDetail?.verses[0]?.[language === "en" ? "en" : "yo"]?.[0] ??
    (hymnOfTheDay ? hymnCategoryName(hymnOfTheDay) : "");

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 overflow-y-auto pt-3 pb-3 space-y-5"
        style={{ scrollbarWidth: "none" }}
      >
        {hymnOfTheDay && (
          <div className="px-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-2">
              {tr("Hymn of the Day", "Orin Ọjọ Oni")}
            </p>

            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setShowCategoriesSheet(false);
                setShowFavoritesSheet(false);
                setShowHymnOfTheDay(true);
              }}
              onKeyDown={(e) => {
                // Only respond to keys originating on the card itself, so
                // keydowns bubbling from the inner Sing Now button are ignored.
                if (e.target !== e.currentTarget) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowCategoriesSheet(false);
                  setShowFavoritesSheet(false);
                  setShowHymnOfTheDay(true);
                }
              }}
              className="rounded-[20px] bg-primary overflow-hidden relative cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="absolute right-3 top-3 opacity-[0.07] pointer-events-none">
                <svg width="90" height="90" viewBox="0 0 48 48" fill="white">
                  <path d="M24 8 C16 8 5 11 3 14 L3 43 C5 40 16 38 24 38 C32 38 43 40 45 43 L45 14 C43 11 32 8 24 8Z" />
                  <line
                    x1="24"
                    y1="8"
                    x2="24"
                    y2="38"
                    strokeWidth="3"
                    stroke="white"
                  />
                </svg>
              </div>

              <div className="relative p-5">
                <div className="flex items-start justify-between mb-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={{
                      background: "rgba(212,160,23,0.25)",
                      color: "#D4A017",
                      border: "1px solid rgba(212,160,23,0.35)",
                    }}
                  >
                    <Star className="w-3 h-3 fill-current" />
                    {tr("Featured", "Àkọ́ Orin")}
                  </span>

                  <span className="text-white/20 text-4xl font-black leading-none">
                    #{displayHymnNumber(hymnOfTheDay)}
                  </span>
                </div>

                <h3 className="text-[20px] font-bold text-white leading-snug">
                  {hymnTitle(hymnOfTheDay)}
                </h3>

                <p className="text-white/55 text-xs mt-1.5 mb-4 line-clamp-2 leading-relaxed">
                  {hymnDayLine}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void openHymn(hymnOfTheDay, "home");
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold shadow-md active:scale-95 transition-transform"
                    style={{ background: "#D4A017", color: "#1A1A2E" }}
                  >
                    <Music className="w-4 h-4" />
                    {tr("Sing Now", "Korin Báyìí")}
                  </button>

                  <span className="text-white/40 text-xs capitalize truncate">
                    {hymnCategoryName(hymnOfTheDay)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {recentHymns.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-4 mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">
                {tr("Recently Viewed", "Tí a Ṣẹ̀ṣẹ̀ Wò")}
              </p>
            </div>

            <div
              className="flex gap-2.5 px-4 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {recentHymns.map((hymn) => (
                <button
                  key={hymn.id}
                  onClick={() => void openHymn(hymn, "home")}
                  className="flex-shrink-0 w-[118px] bg-card border border-border rounded-2xl p-3 text-left active:scale-95 transition-transform"
                >
                  <span
                    className="text-[11px] font-black"
                    style={{ color: "#D4A017" }}
                  >
                    #{displayHymnNumber(hymn)}
                  </span>

                  <p className="text-foreground text-xs font-semibold mt-1 line-clamp-2 leading-snug">
                    {hymnTitle(hymn)}
                  </p>

                  <p className="text-muted-foreground text-[10px] mt-1 capitalize truncate">
                    {hymnCategoryName(hymn)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-4">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-3">
            {tr("Quick Access", "Ìráàyèsí Iyára")}
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                Icon: BookOpen,
                en: "All Hymns",
                yo: "Gbogbo Orin",
                color: "#1A237E",
                bg: "#E8EAFB",
                action: openAllHymns,
              },
              {
                Icon: Heart,
                en: "Favorites",
                yo: "Àyọ̀ Mi",
                color: "#C62828",
                bg: "#FFEBEE",
                action: () => {
                  setShowHymnOfTheDay(false);
                  setShowCategoriesSheet(false);
                  setShowFavoritesSheet(true);
                },
              },
              {
                Icon: Grid3X3,
                en: "Categories",
                yo: "Ẹ̀ka",
                color: "#2E7D32",
                bg: "#E8F5E9",
                action: () => {
                  setShowHymnOfTheDay(false);
                  setShowFavoritesSheet(false);
                  setShowCategoriesSheet(true);
                },
              },
              {
                Icon: Search,
                en: "Search",
                yo: "Ìwádìí",
                color: "#B8860B",
                bg: "#FDF3DC",
                action: () => navigateTab("search"),
              },
            ].map(({ Icon, en, yo, color, bg, action }) => (
              <button
                key={en}
                onClick={action}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-all text-left hover:border-primary/20"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: bg }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>

                <span className="text-[13px] font-semibold text-foreground">
                  {language === "en" ? en : yo}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">
              {tr("Browse Hymns", "Ìwò Àwọn Orin")}
            </p>

            <span className="text-[10px] text-muted-foreground">
              {hymns.length} {tr("hymns", "orin")}
            </span>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {hymns.slice(0, 8).map((hymn) => (
              <button
                key={hymn.id}
                onClick={() => void openHymn(hymn, "home")}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                <span
                  className="font-black text-sm w-10 flex-shrink-0"
                  style={{ color: "#D4A017" }}
                >
                  {displayHymnNumber(hymn)}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-semibold truncate">
                    {hymnTitle(hymn)}
                  </p>

                  <p className="text-muted-foreground text-[11px] truncate">
                    {hymnOtherTitle(hymn)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {favorites.includes(hymn.id) && (
                    <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />
                  )}

                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
