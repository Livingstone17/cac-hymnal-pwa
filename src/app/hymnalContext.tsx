import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type {
  CategoryDef,
  Hymn,
  HymnSummary,
  Language,
  Screen,
  SettingsLanguage,
  Tab,
} from "../types/hymnal";

import {
  LS_DARK_MODE,
  LS_FAVORITES,
  LS_FONT_SIZE,
  LS_LANGUAGE,
  LS_ONBOARDED,
  LS_RECENTLY_VIEWED,
  LS_RECENT_SEARCHES,
  LS_REMINDER_ENABLED,
  LS_REMINDER_TIME,
  LS_SETTINGS_LANG,
  OFFLINE_READY_KEY,
} from "../constants/hymnal";

import {
  detectBrowserLanguage,
  loadLanguage,
  loadLocal,
  saveLocal,
} from "../lib/localStorage";

import {
  cacheClear,
  cacheGet,
  cacheSet,
} from "../lib/indexedDB";

import {
  displayHymnNumber,
  getHymnCategoryName,
  getHymnTitle,
  getOtherHymnTitle,
} from "../lib/hymnUtils";

import { buildCategoriesFromHymns } from "../lib/categoryUtils";

import {
  downloadAllHymns,
  getCatalogCached,
  getCatalogFresh,
  getHymnCached,
  refreshCatalogInBackground,
  searchCachedLyrics,
} from "../services/hymnizeApiLayer";

import { haptic } from "../lib/haptics";

export function getTimeGreeting(): { en: string; yo: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return { en: "Good Morning ☀️", yo: "Ẹ káàárọ̀ ☀️" };
  } else if (hour >= 12 && hour < 17) {
    return { en: "Good Afternoon 🌤️", yo: "Ẹ káàásan o" };
  } else if (hour >= 17 && hour < 21) {
    return { en: "Good Evening 🌙", yo: "Ẹ kú ìrọ̀lẹ́" };
  } else {
    return { en: "Good Night 🌌", yo: "Ẹ kú alẹ́" };
  }
}

interface HymnalContextValue {
  // ── Navigation ──
  screen: Screen;
  setScreen: React.Dispatch<React.SetStateAction<Screen>>;
  prevScreen: Screen;
  activeTab: Tab;
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
  showBottomNav: boolean;
  navigateTab: (tab: Tab) => void;
  goBack: () => void;
  openAllHymns: () => void;
  openHymn: (hymn: HymnSummary, from?: Screen) => Promise<void>;

  // ── Language ──
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  hymnLang: Language;
  setHymnLang: React.Dispatch<React.SetStateAction<Language>>;
  settingsLang: SettingsLanguage;
  setSettingsLang: React.Dispatch<React.SetStateAction<SettingsLanguage>>;
  tr: (en: string, yo: string) => string;
  hymnTitle: (h: HymnSummary, lang?: Language) => string;
  hymnOtherTitle: (h: HymnSummary, lang?: Language) => string;
  hymnCategoryName: (h: HymnSummary) => string;

  // ── Catalog ──
  hymns: HymnSummary[];
  hymnsLoading: boolean;
  hymnsError: string | null;
  loadCatalog: (options?: { force?: boolean; silent?: boolean }) => Promise<void>;

  // ── Derived data ──
  categories: CategoryDef[];
  hymnOfTheDay: HymnSummary | null;
  hymnOfTheDayDetail: Hymn | null;
  recentHymns: HymnSummary[];
  favoriteHymns: HymnSummary[];

  // ── Hymn detail ──
  selectedHymn: Hymn | null;
  pendingHymn: HymnSummary | null;
  hymnDetailLoading: boolean;
  hymnDetailError: string | null;
  metaExpanded: boolean;
  setMetaExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  heartPulse: boolean;

  // ── Favorites / recent ──
  favorites: number[];
  recentlyViewed: number[];
  toggleFavorite: (id: number) => void;
  swipedFavId: number | null;
  setSwipedFavId: React.Dispatch<React.SetStateAction<number | null>>;

  // ── Search ──
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  recentSearches: string[];
  setRecentSearches: React.Dispatch<React.SetStateAction<string[]>>;
  lyricsResults: HymnSummary[];
  lyricsSearchLoading: boolean;
  byNumber: HymnSummary[];
  byTitle: HymnSummary[];
  byCategory: HymnSummary[];

  // ── Categories ──
  selectedCategory: CategoryDef | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<CategoryDef | null>>;

  // ── Settings ──
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  reminderEnabled: boolean;
  setReminderEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  reminderTime: string;
  setReminderTime: React.Dispatch<React.SetStateAction<string>>;
  isOnline: boolean;

  // ── Offline ──
  offlineReady: boolean;
  offlineDownload: { done: number; total: number; running: boolean } | null;
  offlineDownloadError: string | null;
  handleDownloadAll: () => Promise<void>;
  handleClearAllData: () => Promise<void>;

  // ── Devotional / misc ──
  showDevotional: boolean;
  setShowDevotional: React.Dispatch<React.SetStateAction<boolean>>;
  showHymnOfTheDay: boolean;
  setShowHymnOfTheDay: React.Dispatch<React.SetStateAction<boolean>>;
  showCategoriesSheet: boolean;
  setShowCategoriesSheet: React.Dispatch<React.SetStateAction<boolean>>;
  showFavoritesSheet: boolean;
  setShowFavoritesSheet: React.Dispatch<React.SetStateAction<boolean>>;
  handleShareHymn: () => Promise<void>;
}

const HymnalContext = createContext<HymnalContextValue | null>(null);

export function useHymnal(): HymnalContextValue {
  const ctx = useContext(HymnalContext);
  if (!ctx) {
    throw new Error("useHymnal must be used inside <HymnalProvider>");
  }
  return ctx;
}

export function HymnalProvider({ children }: { children: ReactNode }) {
  const openRequestId = useRef(0);
  const devotionalShown = useRef(false);

  const [screen, setScreen] = useState<Screen>(() =>
    loadLocal<boolean>(LS_ONBOARDED, false) ? "home" : "onboarding"
  );

  const [prevScreen, setPrevScreen] = useState<Screen>("home");
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const [language, setLanguage] = useState<Language>(() => loadLanguage());
  const [hymnLang, setHymnLang] = useState<Language>(() => loadLanguage());

  const [hymns, setHymns] = useState<HymnSummary[]>([]);
  const [hymnsLoading, setHymnsLoading] = useState(true);
  const [hymnsError, setHymnsError] = useState<string | null>(null);

  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  const [pendingHymn, setPendingHymn] = useState<HymnSummary | null>(null);
  const [hymnDetailLoading, setHymnDetailLoading] = useState(false);
  const [hymnDetailError, setHymnDetailError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryDef | null>(null);

  const [favorites, setFavorites] = useState<number[]>(() =>
    loadLocal<number[]>(LS_FAVORITES, [])
  );

  const [recentlyViewed, setRecentlyViewed] = useState<number[]>(() =>
    loadLocal<number[]>(LS_RECENTLY_VIEWED, [])
  );

  const [searchQuery, setSearchQuery] = useState("");

  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    loadLocal<string[]>(LS_RECENT_SEARCHES, [
      "Amazing Grace",
      "Holy Holy Holy",
      "Morning",
    ])
  );

  const [lyricsResults, setLyricsResults] = useState<HymnSummary[]>([]);
  const [lyricsSearchLoading, setLyricsSearchLoading] = useState(false);

  const [darkMode, setDarkMode] = useState<boolean>(() =>
    loadLocal<boolean>(LS_DARK_MODE, false)
  );

  const [fontSize, setFontSize] = useState<number>(() =>
    loadLocal<number>(LS_FONT_SIZE, 16)
  );

  const [showDevotional, setShowDevotional] = useState(false);
  const [showHymnOfTheDay, setShowHymnOfTheDay] = useState(false);
  const [showCategoriesSheet, setShowCategoriesSheet] = useState(false);
  const [showFavoritesSheet, setShowFavoritesSheet] = useState(false);
  const [heartPulse, setHeartPulse] = useState(false);

  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() =>
    loadLocal<boolean>(LS_REMINDER_ENABLED, true)
  );

  const [reminderTime, setReminderTime] = useState<string>(() =>
    loadLocal<string>(LS_REMINDER_TIME, "06:00")
  );

  const [settingsLang, setSettingsLang] = useState<"en" | "yo" | "auto">(() =>
    loadLocal<"en" | "yo" | "auto">(LS_SETTINGS_LANG, loadLanguage())
  );

  const [metaExpanded, setMetaExpanded] = useState(false);
  const [swipedFavId, setSwipedFavId] = useState<number | null>(null);

  const [offlineReady, setOfflineReady] = useState(false);
  const [offlineDownload, setOfflineDownload] = useState<{
    done: number;
    total: number;
    running: boolean;
  } | null>(null);
  const [offlineDownloadError, setOfflineDownloadError] =
    useState<string | null>(null);

  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  // ── Persistence ─────────────────────────────────────────────────────────────

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    saveLocal(LS_DARK_MODE, darkMode);
  }, [darkMode]);

  useEffect(() => saveLocal(LS_LANGUAGE, language), [language]);
  useEffect(() => saveLocal(LS_SETTINGS_LANG, settingsLang), [settingsLang]);
  useEffect(() => saveLocal(LS_FAVORITES, favorites), [favorites]);
  useEffect(
    () => saveLocal(LS_RECENTLY_VIEWED, recentlyViewed),
    [recentlyViewed]
  );
  useEffect(
    () => saveLocal(LS_RECENT_SEARCHES, recentSearches),
    [recentSearches]
  );
  useEffect(() => saveLocal(LS_FONT_SIZE, fontSize), [fontSize]);
  useEffect(
    () => saveLocal(LS_REMINDER_ENABLED, reminderEnabled),
    [reminderEnabled]
  );
  useEffect(() => saveLocal(LS_REMINDER_TIME, reminderTime), [reminderTime]);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    cacheGet<boolean>(OFFLINE_READY_KEY).then((value) =>
      setOfflineReady(Boolean(value))
    );
  }, []);

  // ── Catalog Loading ─────────────────────────────────────────────────────────

  const loadCatalog = useCallback(
    async (options?: { force?: boolean; silent?: boolean }) => {
      if (!options?.silent) {
        setHymnsLoading(true);
      }

      setHymnsError(null);

      try {
        const data = options?.force
          ? await getCatalogFresh()
          : await getCatalogCached();

        setHymns(data);
      } catch (error) {
        setHymnsError(
          error instanceof Error ? error.message : "Failed to load hymns."
        );
      } finally {
        if (!options?.silent) {
          setHymnsLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadCatalog();

    refreshCatalogInBackground((fresh) => {
      setHymns(fresh);
    });
  }, [loadCatalog]);

  // ── Derived Data ────────────────────────────────────────────────────────────

  const categories = useMemo(
    () => buildCategoriesFromHymns(hymns),
    [hymns]
  );

  const hymnOfTheDay = useMemo(() => {
    if (!hymns.length) return null;

    const today = new Date();
    const index = (today.getDay() + today.getDate()) % hymns.length;

    return hymns[index];
  }, [hymns]);

  const [hymnOfTheDayDetail, setHymnOfTheDayDetail] =
    useState<Hymn | null>(null);

  useEffect(() => {
    let alive = true;

    if (!hymnOfTheDay) {
      setHymnOfTheDayDetail(null);
      return;
    }

    getHymnCached(hymnOfTheDay)
      .then((hymn) => {
        if (alive) setHymnOfTheDayDetail(hymn);
      })
      .catch(() => {
        if (alive) setHymnOfTheDayDetail(null);
      });

    return () => {
      alive = false;
    };
  }, [hymnOfTheDay?.id]);

  const recentHymns = useMemo(
    () =>
      recentlyViewed
        .map((id) => hymns.find((h) => h.id === id))
        .filter(Boolean) as HymnSummary[],
    [recentlyViewed, hymns]
  );

  const favoriteHymns = useMemo(
    () =>
      favorites
        .map((id) => hymns.find((h) => h.id === id))
        .filter(Boolean) as HymnSummary[],
    [favorites, hymns]
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return [];

    return hymns.filter((h) => {
      return (
        h.number.toString().includes(q) ||
        displayHymnNumber(h).toLowerCase().includes(q) ||
        h.titleEn.toLowerCase().includes(q) ||
        h.titleYo.toLowerCase().includes(q) ||
        h.categoryEn.toLowerCase().includes(q) ||
        h.categoryYo.toLowerCase().includes(q) ||
        h.hymnType.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, hymns]);

  const byNumber = useMemo(
    () =>
      searchResults.filter((h) => {
        const q = searchQuery.trim().toLowerCase();

        return (
          h.number.toString().includes(q) ||
          displayHymnNumber(h).toLowerCase().includes(q)
        );
      }),
    [searchResults, searchQuery]
  );

  const byTitle = useMemo(
    () =>
      searchResults.filter((h) => {
        const q = searchQuery.trim().toLowerCase();

        return (
          h.titleEn.toLowerCase().includes(q) ||
          h.titleYo.toLowerCase().includes(q)
        );
      }),
    [searchResults, searchQuery]
  );

  const byCategory = useMemo(
    () =>
      searchResults.filter((h) => {
        const q = searchQuery.trim().toLowerCase();

        return (
          h.categoryEn.toLowerCase().includes(q) ||
          h.categoryYo.toLowerCase().includes(q) ||
          h.hymnType.toLowerCase().includes(q)
        );
      }),
    [searchResults, searchQuery]
  );

  useEffect(() => {
    let alive = true;

    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setLyricsResults([]);
      setLyricsSearchLoading(false);
      return;
    }

    setLyricsSearchLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const results = await searchCachedLyrics(hymns, q);

        if (alive) {
          setLyricsResults(results);
        }
      } finally {
        if (alive) {
          setLyricsSearchLoading(false);
        }
      }
    }, 350);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery, offlineReady, hymns]);

  const showBottomNav = screen !== "onboarding" && screen !== "hymn-detail";

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const tr = (en: string, yo: string) => (language === "en" ? en : yo);

  const hymnTitle = (h: HymnSummary, lang?: Language) =>
    getHymnTitle(h, lang ?? language);

  const hymnOtherTitle = (h: HymnSummary, lang?: Language) =>
    getOtherHymnTitle(h, lang ?? language);

  const hymnCategoryName = (h: HymnSummary) =>
    getHymnCategoryName(h, language);

  const openHymn = async (hymn: HymnSummary, from?: Screen) => {
    const requestId = openRequestId.current + 1;
    openRequestId.current = requestId;

    setPrevScreen(from ?? screen);
    setPendingHymn(hymn);
    setSelectedHymn(null);
    setHymnDetailLoading(true);
    setHymnDetailError(null);
    setHymnLang(language);
    setMetaExpanded(false);

    setRecentlyViewed((prev) =>
      [hymn.id, ...prev.filter((id) => id !== hymn.id)].slice(0, 12)
    );

    setScreen("hymn-detail");

    try {
      const fullHymn = await getHymnCached(hymn);

      if (openRequestId.current === requestId) {
        setSelectedHymn(fullHymn);
      }
    } catch (error) {
      if (openRequestId.current === requestId) {
        setHymnDetailError(
          error instanceof Error ? error.message : "Could not load hymn."
        );
      }
    } finally {
      if (openRequestId.current === requestId) {
        setHymnDetailLoading(false);
      }
    }
  };

  const goBack = () => {
    openRequestId.current += 1;

    setScreen(prevScreen);
    setSelectedHymn(null);
    setPendingHymn(null);
    setHymnDetailLoading(false);
    setHymnDetailError(null);

    if (
      [
        "home",
        "search",
        "categories",
        "category-detail",
        "favorites",
        "settings",
      ].includes(prevScreen)
    ) {
      const tabMap: Record<string, Tab> = {
        home: "home",
        search: "search",
        categories: "categories",
        "category-detail": "categories",
        favorites: "favorites",
        settings: "settings",
      };

      setActiveTab(tabMap[prevScreen] ?? "home");
    }
  };

  const openAllHymns = () => {
    setSelectedCategory(null);
    setSelectedHymn(null);
    setPendingHymn(null);
    setHymnDetailError(null);
    setPrevScreen("home");
    setActiveTab("home");
    setScreen("all-hymns");
  };

  const navigateTab = (tab: Tab) => {
    openRequestId.current += 1;

    setActiveTab(tab);

    const m: Record<Tab, Screen> = {
      home: "home",
      search: "search",
      categories: "categories",
      favorites: "favorites",
      settings: "settings",
    };

    setScreen(m[tab]);
    setSelectedHymn(null);
    setPendingHymn(null);
    setSelectedCategory(null);
    setHymnDetailError(null);
  };

  const toggleFavorite = (id: number) => {
    haptic(15);
    setHeartPulse(true);
    setTimeout(() => setHeartPulse(false), 700);

    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDownloadAll = async () => {
    if (!hymns.length || offlineDownload?.running) return;

    setOfflineDownloadError(null);
    setOfflineDownload({
      done: 0,
      total: hymns.length,
      running: true,
    });

    const result = await downloadAllHymns(hymns, (done, total) => {
      setOfflineDownload({
        done,
        total,
        running: done < total,
      });
    });

    if (result.failed === 0) {
      setOfflineReady(true);
      await cacheSet<boolean>(OFFLINE_READY_KEY, true);
      setOfflineDownload({
        done: hymns.length,
        total: hymns.length,
        running: false,
      });
    } else {
      setOfflineReady(false);
      await cacheSet<boolean>(OFFLINE_READY_KEY, false);
      setOfflineDownloadError(
        `${result.failed} hymns could not be downloaded. Please check your connection and try again.`
      );
      setOfflineDownload((prev) =>
        prev
          ? {
              ...prev,
              running: false,
            }
          : null
      );
    }
  };

  const handleClearAllData = async () => {
    setFavorites([]);
    setRecentlyViewed([]);
    setRecentSearches([]);
    setSwipedFavId(null);
    setOfflineReady(false);
    setOfflineDownload(null);
    setOfflineDownloadError(null);

    await cacheClear();
    await loadCatalog({ force: true, silent: true });
  };

  const handleShareHymn = async () => {
    if (!selectedHymn) return;

    const title = hymnTitle(selectedHymn, hymnLang);
    const lyrics = selectedHymn.verses
      .map((verse) => {
        const lines = hymnLang === "en" ? verse.en : verse.yo;
        return `${tr("Verse", "Ẹsẹ")} ${verse.number}\n${lines.join("\n")}`;
      })
      .join("\n\n");

    const chorus = selectedHymn.chorus
      ? `\n\n${tr("Chorus", "Orin Àárín")}\n${(
          hymnLang === "en" ? selectedHymn.chorus.en : selectedHymn.chorus.yo
        ).join("\n")}`
      : "";

    const text = `${title}\nCAC Gospel Hymnal #${displayHymnNumber(
      selectedHymn
    )}\n\n${lyrics}${chorus}`;

    try {
      if (navigator.share) {
        await navigator.share({ title, text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // User cancelled or sharing failed.
    }
  };

  useEffect(() => {
    if (
      screen === "home" &&
      hymns.length > 0 &&
      !devotionalShown.current &&
      reminderEnabled
    ) {
      devotionalShown.current = true;

      const t = setTimeout(() => setShowDevotional(true), 1800);
      return () => clearTimeout(t);
    }
  }, [screen, hymns.length, reminderEnabled]);

  const value: HymnalContextValue = {
    screen,
    setScreen,
    prevScreen,
    activeTab,
    setActiveTab,
    showBottomNav,
    navigateTab,
    goBack,
    openAllHymns,
    openHymn,

    language,
    setLanguage,
    hymnLang,
    setHymnLang,
    settingsLang,
    setSettingsLang,
    tr,
    hymnTitle,
    hymnOtherTitle,
    hymnCategoryName,

    hymns,
    hymnsLoading,
    hymnsError,
    loadCatalog,

    categories,
    hymnOfTheDay,
    hymnOfTheDayDetail,
    recentHymns,
    favoriteHymns,

    selectedHymn,
    pendingHymn,
    hymnDetailLoading,
    hymnDetailError,
    metaExpanded,
    setMetaExpanded,
    heartPulse,

    favorites,
    recentlyViewed,
    toggleFavorite,
    swipedFavId,
    setSwipedFavId,

    searchQuery,
    setSearchQuery,
    recentSearches,
    setRecentSearches,
    lyricsResults,
    lyricsSearchLoading,
    byNumber,
    byTitle,
    byCategory,

    selectedCategory,
    setSelectedCategory,

    darkMode,
    setDarkMode,
    fontSize,
    setFontSize,
    reminderEnabled,
    setReminderEnabled,
    reminderTime,
    setReminderTime,
    isOnline,

    offlineReady,
    offlineDownload,
    offlineDownloadError,
    handleDownloadAll,
    handleClearAllData,

    showDevotional,
    setShowDevotional,
    showHymnOfTheDay,
    setShowHymnOfTheDay,
    showCategoriesSheet,
    setShowCategoriesSheet,
    showFavoritesSheet,
    setShowFavoritesSheet,
    handleShareHymn,
  };

  return (
    <HymnalContext.Provider value={value}>{children}</HymnalContext.Provider>
  );
}
