import React from "react";

import { Bell, ChevronLeft } from "lucide-react";

import { useHymnal, getTimeGreeting } from "../../app/hymnalContext";

import { displayHymnNumber } from "../../lib/hymnUtils";

import type { Language } from "../../types/hymnal";

import logo from "../../assets/logo.png";

export default function AppBar() {
  const {
    screen,
    language,
    tr,
    goBack,
    navigateTab,
    hymnLang,
    setHymnLang,
    selectedHymn,
    pendingHymn,
    selectedCategory,
    setSelectedCategory,
    setScreen,
    hymns,
    favoriteHymns,
    setShowDevotional,
  } = useHymnal();

  const headingHymn = selectedHymn ?? pendingHymn;

  const chrome = "flex-shrink-0 border-b border-border bg-background/80 backdrop-blur-xl";

  // ── Home: app identity + greeting + reminder bell ──
  if (screen === "home") {
    const greeting = getTimeGreeting();

    return (
      <div className={`flex items-center justify-between px-5 pt-1 pb-2 ${chrome}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={logo} alt="" width={32} height={28} className="flex-shrink-0" />

          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground leading-none font-medium uppercase tracking-wider">
              CAC Gospel Hymnal
            </p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5 truncate">
              {tr(greeting.en, greeting.yo)}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDevotional(true)}
          className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
        >
          <Bell className="w-[18px] h-[18px] text-foreground" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "#D4A017" }}
          />
        </button>
      </div>
    );
  }

  // ── Hymn detail: back + hymn number + EN/YO toggle ──
  if (screen === "hymn-detail") {
    return (
      <div className={`flex items-center gap-3 px-4 py-2 ${chrome}`}>
        <button
          onClick={goBack}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>

        <span className="text-muted-foreground text-sm font-semibold flex-1 min-w-0 truncate">
          {headingHymn
            ? `Hymn #${displayHymnNumber(headingHymn)}`
            : tr("Hymn", "Orin")}
        </span>

        <div className="flex rounded-full border border-border bg-muted p-0.5 gap-0.5 flex-shrink-0">
          {(["en", "yo"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setHymnLang(lang)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                hymnLang === lang
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Category detail: back + icon + name + count ──
  if (screen === "category-detail" && selectedCategory) {
    const { Icon } = selectedCategory;
    const catCount = hymns.filter((h) => h.category === selectedCategory.id).length;

    return (
      <div className={`flex items-center gap-3 px-4 py-2 ${chrome}`}>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setScreen("categories");
          }}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: selectedCategory.bg }}
          >
            <Icon className="w-4 h-4" style={{ color: selectedCategory.color }} />
          </div>

          <h2 className="text-base font-bold text-foreground truncate">
            {language === "en"
              ? selectedCategory.nameEn
              : selectedCategory.nameYo}
          </h2>
        </div>

        <span className="text-xs text-muted-foreground flex-shrink-0">
          {catCount} {tr("hymns", "orin")}
        </span>
      </div>
    );
  }

  // ── All hymns: back + title ──
  if (screen === "all-hymns") {
    return (
      <div className={`flex items-center gap-3 px-4 py-2 ${chrome}`}>
        <button
          onClick={() => navigateTab("home")}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>

        <h2 className="text-base font-bold text-foreground flex-1 min-w-0 truncate">
          {tr("All Hymns", "Gbogbo Orin")}
        </h2>
      </div>
    );
  }

  // ── Tab screens: title (+ favorites count) ──
  const tabTitles: Record<string, [string, string]> = {
    search: ["Search Hymns", "Ìwádìí Orin"],
    categories: ["Categories", "Àwọn Ẹ̀ka"],
    favorites: ["Favorites", "Àyọ̀ Mi"],
    settings: ["Settings", "Ìtòlẹ́sẹẹ̀"],
  };

  const [enTitle, yoTitle] = tabTitles[screen] ?? ["", ""];

  return (
    <div className={`flex items-center px-5 py-2.5 ${chrome}`}>
      <h2 className="text-lg font-bold text-foreground flex-1 min-w-0 truncate">
        {tr(enTitle, yoTitle)}
      </h2>

      {screen === "favorites" && favoriteHymns.length > 0 && (
        <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">
          {favoriteHymns.length} {tr("saved", "tí a pamọ́")}
        </span>
      )}
    </div>
  );
}
