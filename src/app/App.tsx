import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Search,
  Grid3X3,
  Heart,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Share2,
  BookOpen,
  X,
  Moon,
  Sun,
  Star,
  Music,
  GripVertical,
  Hash,
  FileText,
  Info,
  Trash2,
  Globe,
  Clock,
  DownloadCloud,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
} from "lucide-react";
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
  normalizeMeter,
} from "../lib/hymnUtils";

import { buildCategoriesFromHymns } from "../lib/categoryUtils";

import {
  downloadAllHymns,
  getCatalogCached,
  getCatalogFresh,
  getHymnCached,
  refreshCatalogInBackground,
  searchCachedLyrics,
} from "../services/hymnizeApi";

import HymnBookLogo from "../components/shared/HymnBookLogo";
import Toggle from "../components/shared/Toggle";
import SettingsSection from "../components/shared/SettingSection";
import ResultGroup from "../components/shared/ResultGroup";
import StatusBar from "../components/layout/Statusbar";
import BottomNav from "../components/layout/BottomNav";
import logo from "../assets/logo.png";
// import { normalizeMeter } from "./helpers/hymnMeterHelper";
import AllHymnsScreen from "../screens/AllHymnsScreen";




// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
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
  const [onboardLang, setOnboardLang] = useState<Language>(() =>
    loadLanguage()
  );

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

    if (!q || !offlineReady) {
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


  // ── Screen: Onboarding ──────────────────────────────────────────────────────

  const renderOnboarding = () => (
    <div
      className="flex flex-col h-full relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #1A237E 0%, #283593 60%, #1565C0 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute top-1/2 -left-20 w-56 h-56 rounded-full bg-white/5" />
        <div
          className="absolute bottom-1/3 right-4 w-40 h-40 rounded-full"
          style={{ background: "rgba(212,160,23,0.15)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="relative flex flex-col items-center justify-center flex-1 px-8 gap-7 pt-8">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-28 h-28 rounded-[32px] flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(255,255,255,0.2)",
          }}
        >
          {/* <HymnBookLogo size={64} light /> */}
          <img src={logo} alt="" style={{ width: "60", height: "40" }} />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight">
            CAC Gospel Hymnal
          </h1>
          <p className="text-white/60 text-sm mt-1 font-medium">
            Christ Apostolic Church
          </p>
        </motion.div>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-white/75 text-center text-sm leading-relaxed max-w-[270px]"
        >
          {onboardLang === "en"
            ? "Sing praises to the Lord with CAC hymns in English and Yoruba."
            : "Korin orin ìyin sí Oluwa pẹ̀lú orin CAC ní Gẹ̀ẹ́sì àti Yorùbá."}
        </motion.p>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-full"
        >
          <p className="text-white/50 text-[10px] text-center mb-2.5 uppercase tracking-[0.15em] font-semibold">
            Choose Language
          </p>

          <div
            className="flex rounded-2xl overflow-hidden border p-1 gap-1"
            style={{
              borderColor: "rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)",
            }}
          >
            {(["en", "yo"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setOnboardLang(lang)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${onboardLang === lang
                  ? "bg-white text-[#1A237E] shadow-md"
                  : "text-white/70 hover:text-white"
                  }`}
              >
                {lang === "en" ? "🇬🇧  English" : "🇳🇬  Yorùbá"}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="relative px-6 pb-10"
      >
        <button
          onClick={() => {
            setLanguage(onboardLang);
            setSettingsLang(onboardLang);
            saveLocal(LS_ONBOARDED, true);
            setScreen("home");
            setActiveTab("home");
          }}
          className="w-full py-4 rounded-2xl font-bold text-[15px] shadow-xl active:scale-95 transition-transform"
          style={{ background: "#D4A017", color: "#1A1A2E" }}
        >
          {onboardLang === "en" ? "Get Started →" : "Bẹ̀rẹ̀ Sísinú →"}
        </button>

        <p className="text-white/35 text-[11px] text-center mt-3">
          {onboardLang === "en"
            ? "You can change language in Settings anytime"
            : "O le yipada èdè ninu Ètò ni igba eyikeyi"}
        </p>
      </motion.div>
    </div>
  );

  // ── Screen: Home ────────────────────────────────────────────────────────────
  // -----Greeting the user and showing the hymn of the day, or loading/error states if applicable.
  const getTimeGreeting = () => {
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
  };

  const renderHome = () => {
    const greeting = getTimeGreeting();
    if (hymnsLoading && hymns.length === 0) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 pt-1 pb-3 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              {/* <HymnBookLogo size={30} /> */}
              <img src={logo} alt="" style={{ width: 32, height: 28 }} />

              <div>
                <p className="text-[10px] text-muted-foreground leading-none font-medium uppercase tracking-wider">
                  CAC Gospel Hymnal
                </p>
                {/* <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                  {tr("Loading hymns…", "Ń ṣí àwọn orin…")}
                </p> */}
                <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                  {tr(greeting.en, greeting.yo)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">
              {tr(
                "Fetching CAC hymnal from Hymnize…",
                "Ń gba iwe orin CAC láti Hymnize…"
              )}
            </p>
          </div>
        </div>
      );
    }

    if (hymnsError && hymns.length === 0) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 pt-1 pb-3 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              {/* <HymnBookLogo size={30} /> */}
              <img src={logo} alt="" style={{ width: 32, height: 28 }} />

              <div>
                <p className="text-[10px] text-muted-foreground leading-none font-medium uppercase tracking-wider">
                  CAC Gospel Hymnal
                </p>
                <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                  {tr("Could not load hymns", "A kò lè ṣí àwọn orin")}
                </p>
              </div>
            </div>
          </div>

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
        <div className="flex items-center justify-between px-5 pt-1 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {/* <HymnBookLogo size={30} /> */}
            <img src={logo} alt="" style={{ width: 32, height: 28 }} />
            <div>
              <p className="text-[10px] text-muted-foreground leading-none font-medium uppercase tracking-wider">
                CAC Gospel Hymnal
              </p>
              {/* <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                {tr("Good Morning ☀️", "Ẹ káàárọ̀ ☀️")}
              </p> */}
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                {tr(greeting.en, greeting.yo)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDevotional(true)}
            className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center"
          >
            <Bell className="w-[18px] h-[18px] text-foreground" />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: "#D4A017" }}
            />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto pb-3 space-y-5"
          style={{ scrollbarWidth: "none" }}
        >
          {hymnOfTheDay && (
            <div className="px-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-2">
                {tr("Hymn of the Day", "Orin Ọjọ Oni")}
              </p>

              <div className="rounded-[20px] bg-primary overflow-hidden relative">
                <div className="absolute right-3 top-3 opacity-[0.07]">
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
                      onClick={() => void openHymn(hymnOfTheDay, "home")}
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
                  action: () => navigateTab("favorites"),
                },
                {
                  Icon: Grid3X3,
                  en: "Categories",
                  yo: "Ẹ̀ka",
                  color: "#2E7D32",
                  bg: "#E8F5E9",
                  action: () => navigateTab("categories"),
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
  };

  // ── Screen: Hymn Detail ─────────────────────────────────────────────────────

  const renderHymnDetail = () => {
    const headingHymn = selectedHymn ?? pendingHymn;
    const currentMeterKey = normalizeMeter(selectedHymn?.meter);

    const sameMeterHymns =
      selectedHymn && currentMeterKey
        ? hymns.filter(
          (hymn) =>
            hymn.id !== selectedHymn.id &&
            normalizeMeter(hymn.meter) === currentMeterKey
        )
        : [];
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 pt-1 pb-3 border-b border-border flex-shrink-0">
          <button
            onClick={goBack}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>

          <span className="text-muted-foreground text-sm font-semibold flex-1">
            {headingHymn
              ? `Hymn #${displayHymnNumber(headingHymn)}`
              : tr("Hymn", "Orin")}
          </span>

          <div className="flex rounded-full border border-border bg-muted p-0.5 gap-0.5">
            {(["en", "yo"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setHymnLang(lang)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${hymnLang === lang
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground"
                  }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {hymnDetailLoading && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="font-semibold text-foreground">
              {tr("Loading hymn…", "Orin ń ṣí…")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {headingHymn ? hymnTitle(headingHymn) : ""}
            </p>
          </div>
        )}

        {!hymnDetailLoading && hymnDetailError && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <FileText className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="font-bold text-foreground mb-1">
              {tr("Could not load hymn", "A kò lè ṣí orin")}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {hymnDetailError}
            </p>
            {headingHymn && (
              <button
                onClick={() => void openHymn(headingHymn, prevScreen)}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {tr("Retry", "Gbìyànjú")}
              </button>
            )}
          </div>
        )}

        {!hymnDetailLoading && !hymnDetailError && selectedHymn && (
          <>
            <div
              className="flex-1 overflow-y-auto pb-20"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="px-5 pt-5 pb-4">
                <motion.h1
                  key={hymnLang + selectedHymn.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="text-[22px] font-bold text-foreground leading-snug"
                >
                  {hymnTitle(selectedHymn, hymnLang)}
                </motion.h1>

                <p className="text-muted-foreground text-sm mt-1">
                  {hymnOtherTitle(selectedHymn, hymnLang)}
                </p>

                <p className="text-muted-foreground text-xs mt-1.5 font-medium">
                  {hymnLang === "en"
                    ? `Category: ${selectedHymn.categoryEn}`
                    : `Isori: ${selectedHymn.categoryYo}`}
                </p>
                <p className="text-muted-foreground text-xs mt-1.5 font-medium">
                  {selectedHymn.meter ? `Meter: ${selectedHymn.meter}` : "Hymn Meter unknown"}
                </p>
              </div>

              <div className="px-5 space-y-7">
                {selectedHymn.verses.map((verse) => (
                  <motion.div
                    key={`${verse.number}-${hymnLang}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: verse.number * 0.03 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="text-[10px] font-black uppercase tracking-[0.15em]"
                        style={{ color: "#D4A017" }}
                      >
                        {tr("Verse", "Ẹsẹ")} {verse.number}
                      </span>

                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="space-y-2">
                      {(hymnLang === "en" ? verse.en : verse.yo).map(
                        (line, i) => (
                          <p
                            key={i}
                            className="text-foreground leading-[1.8]"
                            style={{ fontSize: `${fontSize}px` }}
                          >
                            {line}
                          </p>
                        )
                      )}
                    </div>
                  </motion.div>
                ))}

                {selectedHymn.chorus && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="rounded-2xl p-4"
                    style={{
                      background: "rgba(26,35,126,0.05)",
                      border: "1px solid rgba(26,35,126,0.12)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">
                        {tr("Chorus", "Orin Àárín")}
                      </span>

                      <div
                        className="flex-1 h-px"
                        style={{ background: "rgba(26,35,126,0.15)" }}
                      />
                    </div>

                    <div className="space-y-2">
                      {(hymnLang === "en"
                        ? selectedHymn.chorus.en
                        : selectedHymn.chorus.yo
                      ).map((line, i) => (
                        <p
                          key={i}
                          className="text-foreground leading-[1.8] font-medium italic"
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="mx-5 mt-7 mb-4 border border-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setMetaExpanded(!metaExpanded)}
                  className="w-full flex items-center justify-between px-4 py-3.5"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {tr("Hymn Details", "Àlàyé Orin")}
                  </span>

                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${metaExpanded ? "rotate-90" : ""
                      }`}
                  />
                </button>

                <AnimatePresence>
                  {metaExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border px-4 pb-4 pt-3 space-y-2.5">
                        {[
                          {
                            label: tr("Category", "Ẹ̀ka"),
                            value:
                              hymnLang === "en"
                                ? selectedHymn.categoryEn
                                : selectedHymn.categoryYo,
                          },
                          {
                            label: tr("Hymn Number", "Nọ́mbà Orin"),
                            value: `#${displayHymnNumber(selectedHymn)}`,
                          },
                          {
                            label: tr("Type", "Irú"),
                            value: selectedHymn.hymnType,
                          },
                          {
                            label: tr("Meter", "Mítà"),
                            value: selectedHymn.meter ?? "—",
                          },
                          {
                            label: tr("Scripture", "Ìwé Mímọ́"),
                            value: selectedHymn.scripture ?? "—",
                          },
                          {
                            label: tr("Verses", "Àwọn Ẹsẹ"),
                            value: String(selectedHymn.verses.length),
                          },
                        ].map((row) => (
                          <div
                            key={row.label}
                            className="flex justify-between items-center gap-4"
                          >
                            <span className="text-xs text-muted-foreground">
                              {row.label}
                            </span>

                            <span className="text-xs font-semibold text-foreground capitalize text-right">
                              {row.value}
                            </span>
                          </div>
                        ))}
                        {selectedHymn.meter && sameMeterHymns.length > 0 && (
                          <div className="pt-3 mt-3 border-t border-border">
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <span className="text-xs text-muted-foreground">
                                {tr("Other Hymns with same Meter as this", "Àwọn Orin miran toni Mítà Kanna pelu orin yi")}
                              </span>

                              <span className="text-xs font-semibold text-foreground">
                                {sameMeterHymns.length} {tr("found", "rí")}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {sameMeterHymns.slice(0, 12).map((hymn) => (
                                <button
                                  key={hymn.id}
                                  onClick={() => void openHymn(hymn, prevScreen)}
                                  className="max-w-full px-2.5 py-1.5 rounded-full bg-muted border border-border text-[11px] font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                                  title={hymnTitle(hymn)}
                                >
                                  #{displayHymnNumber(hymn)} ·{" "}
                                  <span className="inline-block max-w-[130px] truncate align-bottom">
                                    {hymnTitle(hymn)}
                                  </span>
                                </button>
                              ))}
                            </div>

                            {sameMeterHymns.length > 12 && (
                              <p className="text-[11px] text-muted-foreground mt-2">
                                +{sameMeterHymns.length - 12} {tr("more hymns with this meter", "miiran pẹ̀lú mítà yìí")}
                              </p>
                            )}
                          </div>
                        )}
                        <button
                          onClick={handleShareHymn}
                          className="w-full mt-2 flex items-center justify-center gap-2 bg-muted py-2.5 rounded-xl text-sm font-semibold text-foreground"
                        >
                          <Share2 className="w-4 h-4" />
                          {tr("Share Hymn", "Pín Orin")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="absolute bottom-5 right-5 z-10">
              <motion.button
                onClick={() => toggleFavorite(selectedHymn.id)}
                animate={
                  heartPulse && favorites.includes(selectedHymn.id)
                    ? { scale: [1, 1.35, 0.85, 1.12, 1] }
                    : {}
                }
                transition={{ duration: 0.55 }}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors ${favorites.includes(selectedHymn.id)
                  ? "bg-red-500 text-white"
                  : "bg-card border border-border text-muted-foreground"
                  }`}
              >
                <Heart
                  className={`w-6 h-6 transition-all ${favorites.includes(selectedHymn.id) ? "fill-current" : ""
                    }`}
                />
              </motion.button>
            </div>
          </>
        )}
      </div>
    );
  };

  // ── Screen: Search ──────────────────────────────────────────────────────────

  const renderSearch = () => {
    const hasSearchQuery = Boolean(searchQuery.trim());

    const hasAnySearchResults =
      byNumber.length > 0 ||
      byTitle.length > 0 ||
      byCategory.length > 0 ||
      lyricsResults.length > 0 ||
      lyricsSearchLoading;

    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-1 pb-3 flex-shrink-0">
          <h2 className="text-lg font-bold text-foreground mb-3">
            {tr("Search Hymns", "Ìwádìí Orin")}
          </h2>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  setRecentSearches((prev) =>
                    [
                      searchQuery.trim(),
                      ...prev.filter((s) => s !== searchQuery.trim()),
                    ].slice(0, 6)
                  );
                }
              }}
              placeholder={tr(
                "Search by number, title, category, or lyrics…",
                "Ìwádìí nípasẹ̀ nọ́mbà, àkọlé, ẹ̀ka, tàbí orin…"
              )}
              className="w-full pl-10 pr-9 py-3 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2"
              style={
                { "--tw-ring-color": "rgba(26,35,126,0.25)" } as CSSProperties
              }
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {!searchQuery && recentSearches.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {recentSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => setSearchQuery(s)}
                  className="bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-full border border-border hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {!offlineReady && (
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              {tr(
                "Tip: download hymns in Settings to enable offline lyrics search.",
                "Àbá: ṣe igbasilẹ orin ninu Ètò lati jẹ́ kí ìwádìí orin ṣiṣẹ́ láìní ìnítánẹ́ẹ̀tì."
              )}
            </p>
          )}
        </div>

        <div
          className="flex-1 overflow-y-auto px-4 pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {!hasSearchQuery ? (
            <div className="pt-10 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>

              <p className="text-muted-foreground text-sm">
                {tr(
                  `Search ${hymns.length || ""} CAC hymns`,
                  `Ìwádìí orin CAC ${hymns.length || ""}`
                )}
              </p>
            </div>
          ) : !hasAnySearchResults ? (
            <div className="pt-14 text-center px-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>

              <p className="font-bold text-foreground mb-1">
                {tr("No hymns found", "Kò sí orin")}
              </p>

              <p className="text-muted-foreground text-sm">
                {tr(
                  "Try searching in English or Yoruba.",
                  "Gbiyanju ìwádìí ní Gẹ̀ẹ́sì tàbí Yorùbá."
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-5 pt-2">
              {byNumber.length > 0 && (
                <ResultGroup
                  title={tr("By Number", "Nípasẹ̀ Nọ́mbà")}
                  icon={Hash}
                  hymns={byNumber}
                  query={searchQuery}
                  language={language}
                  onOpen={(h) => void openHymn(h, "search")}
                />
              )}

              {byTitle.length > 0 && (
                <ResultGroup
                  title={tr("By Title", "Nípasẹ̀ Àkọlé")}
                  icon={FileText}
                  hymns={byTitle}
                  query={searchQuery}
                  language={language}
                  onOpen={(h) => void openHymn(h, "search")}
                />
              )}

              {byCategory.length > 0 && (
                <ResultGroup
                  title={tr("By Category", "Nípasẹ̀ Ẹ̀ka")}
                  icon={Grid3X3}
                  hymns={byCategory}
                  query={searchQuery}
                  language={language}
                  onOpen={(h) => void openHymn(h, "search")}
                />
              )}

              {lyricsSearchLoading && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {tr("Searching cached lyrics…", "Ń wá nínú orin tí a pamọ́…")}
                </div>
              )}

              {lyricsResults.length > 0 && (
                <ResultGroup
                  title={tr("By Lyrics", "Nípasẹ̀ Orin")}
                  icon={Music}
                  hymns={lyricsResults}
                  query={searchQuery}
                  language={language}
                  onOpen={(h) => void openHymn(h, "search")}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Screen: Categories ──────────────────────────────────────────────────────

  // ── Screen: All Hymns ─────────────────────────────────────────────────────────

  const renderAllHymns = () => (
    <AllHymnsScreen
      hymns={hymns}
      favorites={favorites}
      language={language}
      onBack={() => {
        setScreen("home");
        setActiveTab("home");
      }}
      onOpenHymn={(hymn) => void openHymn(hymn, "all-hymns")}
    />
  );



  const renderCategories = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-1 pb-3 flex-shrink-0">
        <h2 className="text-lg font-bold text-foreground">
          {tr("Categories", "Àwọn Ẹ̀ka")}
        </h2>

        <p className="text-muted-foreground text-sm">
          {tr("Browse hymns by theme", "Wo àwọn orin nípasẹ̀ àkòrí")}
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const { Icon } = cat;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setScreen("category-detail");
                }}
                className="bg-card border border-border rounded-2xl p-4 text-left active:scale-95 transition-all hover:border-primary/20"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: cat.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: cat.color }} />
                </div>

                <p className="font-bold text-foreground text-[13px] line-clamp-2 leading-snug">
                  {language === "en" ? cat.nameEn : cat.nameYo}
                </p>

                <p className="text-muted-foreground text-xs mt-0.5">
                  {cat.hymnCount} {tr("hymns", "orin")}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Screen: Category Detail ─────────────────────────────────────────────────

  const renderCategoryDetail = () => {
    if (!selectedCategory) return null;

    const { Icon } = selectedCategory;

    const catHymns = hymns.filter(
      (h) => h.category === selectedCategory.id
    );

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 pt-1 pb-3 border-b border-border flex-shrink-0">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setScreen("categories");
            }}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: selectedCategory.bg }}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: selectedCategory.color }}
              />
            </div>

            <h2 className="text-base font-bold text-foreground truncate">
              {language === "en"
                ? selectedCategory.nameEn
                : selectedCategory.nameYo}
            </h2>
          </div>

          <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
            {catHymns.length} {tr("hymns", "orin")}
          </span>
        </div>

        <div
          className="flex-1 overflow-y-auto pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="divide-y divide-border">
            {catHymns.map((hymn) => (
              <button
                key={hymn.id}
                onClick={() => void openHymn(hymn, "category-detail")}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors text-left"
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
    );
  };

  // ── Screen: Favorites ───────────────────────────────────────────────────────

  const renderFavorites = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-1 pb-3 flex-shrink-0">
        <h2 className="text-lg font-bold text-foreground">
          {tr("Favorites", "Àyọ̀ Mi")}
        </h2>

        <p className="text-muted-foreground text-sm">
          {favoriteHymns.length} {tr("saved hymns", "orin tí a pamọ́")}
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        {favoriteHymns.length === 0 ? (
          <div className="pt-20 text-center px-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#FFF0F0" }}
            >
              <Heart className="w-9 h-9 text-red-200" />
            </div>

            <p className="font-bold text-foreground text-base mb-1">
              {tr("No favorites yet", "Ko sí orin ayọ̀")}
            </p>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {tr(
                "Tap the heart icon while reading a hymn.",
                "Tẹ àmi ọkàn nígbà tí o bá ń ka orin."
              )}
            </p>

            <button
              onClick={() => navigateTab("search")}
              className="mt-5 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              {tr("Find Hymns", "Ìwádìí Orin")}
            </button>
          </div>
        ) : (
          <div className="px-4 space-y-2">
            {favoriteHymns.map((hymn) => (
              <div key={hymn.id} className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4 rounded-2xl">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>

                <motion.div
                  animate={{ x: swipedFavId === hymn.id ? -76 : 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 32 }}
                  className="relative bg-card border border-border rounded-2xl"
                >
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                    <span
                      className="font-black text-sm w-10 flex-shrink-0"
                      style={{ color: "#D4A017" }}
                    >
                      {displayHymnNumber(hymn)}
                    </span>

                    <button
                      className="flex-1 min-w-0 text-left"
                      onClick={() =>
                        swipedFavId === hymn.id
                          ? setSwipedFavId(null)
                          : void openHymn(hymn, "favorites")
                      }
                    >
                      <p className="text-foreground text-sm font-semibold truncate">
                        {hymnTitle(hymn)}
                      </p>

                      <p className="text-muted-foreground text-[11px] capitalize truncate">
                        {hymnCategoryName(hymn)}
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        setSwipedFavId(
                          swipedFavId === hymn.id ? null : hymn.id
                        )
                      }
                      className="flex-shrink-0 p-1"
                    >
                      <Heart className="w-5 h-5 text-red-400 fill-current" />
                    </button>
                  </div>
                </motion.div>

                {swipedFavId === hymn.id && (
                  <button
                    onClick={() => {
                      toggleFavorite(hymn.id);
                      setSwipedFavId(null);
                    }}
                    className="absolute right-0 top-0 bottom-0 w-20"
                  />
                )}
              </div>
            ))}

            <p className="text-center text-xs text-muted-foreground pt-2">
              {tr("Tap heart to remove", "Tẹ ọkàn láti yọ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ── Screen: Settings ────────────────────────────────────────────────────────

  const renderSettings = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-1 pb-3 flex-shrink-0">
        <h2 className="text-lg font-bold text-foreground">
          {tr("Settings", "Ìtòlẹ́sẹẹ̀")}
        </h2>
      </div>

      <div
        className="flex-1 overflow-y-auto pb-6 space-y-3 px-4"
        style={{ scrollbarWidth: "none" }}
      >
        <SettingsSection title={tr("Language", "Èdè")} icon={Globe}>
          <div className="space-y-1">
            {(
              [
                ["en", "🇬🇧  English"],
                ["yo", "🇳🇬  Yorùbá"],
                ["auto", `🌐  ${tr("Auto-detect", "Àwárí Adáṣe")}`],
              ] as ["en" | "yo" | "auto", string][]
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => {
                  setSettingsLang(val);

                  if (val === "auto") {
                    setLanguage(detectBrowserLanguage());
                  } else {
                    setLanguage(val);
                  }
                }}
                className="w-full flex items-center justify-between py-2.5"
              >
                <span className="text-sm text-foreground">{label}</span>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${settingsLang === val
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40"
                    }`}
                >
                  {settingsLang === val && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection title={tr("Offline Hymns", "Orin Laini Ayelujara")} icon={DownloadCloud}>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: offlineReady
                    ? "rgba(46,125,50,0.12)"
                    : "rgba(212,160,23,0.14)",
                }}
              >
                {offlineReady ? (
                  <BookOpen className="w-5 h-5 text-green-600" />
                ) : (
                  <DownloadCloud className="w-5 h-5 text-[#B8860B]" />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {offlineReady
                    ? tr("Offline hymns ready", "Àwọn orin ti ṣetan laini ayelujara")
                    : tr("Download all hymns", "Ṣe igbasilẹ gbogbo orin")}
                </p>

                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  {tr(
                    "This caches English and Yoruba lyrics for offline reading and lyrics search. Recommended on Wi‑Fi.",
                    "Èyí máa pamọ́ orin Gẹ̀ẹ́sì àti Yorùbá fún kika laini ayelujara ati ìwádìí orin. Ó dára lori Wi‑Fi."
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => void handleDownloadAll()}
              disabled={!hymns.length || offlineDownload?.running}
              className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 ${offlineDownload?.running
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground"
                }`}
            >
              {offlineDownload?.running ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <DownloadCloud className="w-4 h-4" />
              )}

              {offlineDownload?.running
                ? tr("Downloading…", "Ń ṣe igbasilẹ…")
                : offlineReady
                  ? tr("Refresh offline hymns", "Ṣe imudojuiwọn orin offline")
                  : tr("Download hymns for offline use", "Ṣe igbasilẹ orin fun offline")}
            </button>

            {offlineDownload && (
              <div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${offlineDownload.total
                        ? (offlineDownload.done / offlineDownload.total) * 100
                        : 0
                        }%`,
                    }}
                  />
                </div>

                <p className="text-center text-xs text-muted-foreground mt-1.5">
                  {offlineDownload.done} / {offlineDownload.total}{" "}
                  {tr("downloaded", "ti ṣe igbasilẹ")}
                </p>
              </div>
            )}

            {offlineDownloadError && (
              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                {offlineDownloadError}
              </p>
            )}
          </div>
        </SettingsSection>

        <SettingsSection title={tr("Devotional Reminder", "Ìránilétí Ìjọ̀sìn")} icon={Bell}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                {tr("Daily reminder", "Ìránilétí ojoojúmọ́")}
              </span>

              <Toggle
                on={reminderEnabled}
                onToggle={() => setReminderEnabled(!reminderEnabled)}
              />
            </div>

            {reminderEnabled && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {tr("Time", "Àkókò")}
                </span>

                <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />

                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="text-sm font-semibold bg-transparent text-foreground outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </SettingsSection>

        <SettingsSection title={tr("Lyrics Font Size", "Iwọn Àkọ́ Orin")} icon={FileText}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">A</span>
              <span className="text-sm font-bold text-foreground">
                {fontSize}px
              </span>
              <span className="text-lg font-bold text-muted-foreground">A</span>
            </div>

            <input
              type="range"
              min={12}
              max={24}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />

            <div className="bg-muted rounded-xl p-3">
              <p
                className="text-foreground leading-relaxed"
                style={{ fontSize: `${fontSize}px` }}
              >
                {tr(
                  "Great Shepherd of thy people, hear…",
                  "Olus’agutan eni Re…"
                )}
              </p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title={tr("Appearance", "Àwòrán")} icon={darkMode ? Moon : Sun}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {darkMode ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-muted-foreground" />
              )}

              <span className="text-sm text-foreground">
                {tr("Dark Mode", "Ipo Dudu")}
              </span>
            </div>

            <Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </div>
        </SettingsSection>

        <SettingsSection title={tr("About", "Nípa")} icon={Info}>
          <div className="space-y-2.5">
            {[
              [tr("App Version", "Ẹya Ohun Èlò"), "1.0.0"],
              [tr("Source", "Orísun"), "Hymnize API"],
              [tr("Denomination", "Ìjọ"), "CAC"],
              [tr("Total Hymns", "Àpapọ̀ Orin"), hymns.length ? String(hymns.length) : "—"],
              [tr("Languages", "Àwọn Èdè"), "English · Yorùbá"],
              [
                tr("Connection", "Ìbánisọ̀rọ̀"),
                isOnline ? tr("Online", "Online") : tr("Offline", "Offline"),
              ],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between items-center gap-4">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-semibold text-foreground text-right">
                  {value}
                </span>
              </div>
            ))}

            <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border mt-1">
              {tr(
                "A digital hymnal for CAC congregations worldwide, powered by Hymnize and optimized for offline PWA use.",
                "Iwe orin ìjọsìn alailẹgbẹ fún àwọn ìjọ CAC káàkiri àgbáálá ayé, ti Hymnize ń ṣiṣẹ́ fún ati tí a ṣe fún offline PWA."
              )}
            </p>
          </div>
        </SettingsSection>

        <button
          onClick={() => void handleClearAllData()}
          className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 text-red-600 dark:text-red-400"
          style={{ background: "rgba(198,40,40,0.08)" }}
        >
          <Trash2 className="w-4 h-4" />
          {tr("Clear All Data", "Pa Gbogbo Dátà")}
        </button>

        <p className="text-center text-[11px] text-muted-foreground">
          Made with ♥ for CAC congregations worldwide
        </p>
        <p className="text-center text-[11px] text-muted-foreground pb-2">
          ©Phos Technologies. All rights reserved.
        </p>
      </div>
    </div>
  );

  // ── Modal: Devotional Reminder ──────────────────────────────────────────────

  const DevotionalModal = () => {
    const greeting = getTimeGreeting();

    if (!hymnOfTheDay) return null;

    const line =
      hymnOfTheDayDetail?.verses[0]?.[language === "en" ? "en" : "yo"]?.[0] ??
      hymnCategoryName(hymnOfTheDay);

    return (
      <AnimatePresence>
        {showDevotional && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setShowDevotional(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-card rounded-t-3xl p-6 pb-10 shadow-2xl"
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />

              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: "rgba(212,160,23,0.15)" }}
                >
                  🌅
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">
                    {tr("Devotional Reminder", "Ìránilétí Ìjọ̀sìn")}
                  </p>

                  <h3 className="text-lg font-bold text-foreground">
                    {/* {tr("Good Morning!", "Ẹ káàárọ̀!")} */}
                    {tr(greeting.en, greeting.yo)}

                  </h3>

                </div>
              </div>

              <div
                className="rounded-2xl p-4 mb-5"
                style={{
                  background: "rgba(26,35,126,0.05)",
                  border: "1px solid rgba(26,35,126,0.12)",
                }}
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">
                  {tr("Today's Hymn", "Orin Ọjọ Oni")}
                </p>

                <h4 className="text-base font-bold text-foreground">
                  {hymnTitle(hymnOfTheDay)}
                </h4>

                <p className="text-muted-foreground text-xs mt-1.5 italic leading-relaxed">
                  {line}
                </p>
              </div>

              <p className="text-sm text-muted-foreground text-center mb-5">
                {tr("Start your day with praise ✨", "Bẹ̀rẹ̀ ọjọ́ rẹ pẹ̀lú ìyin ✨")}
              </p>

              <button
                onClick={() => {
                  setShowDevotional(false);
                  void openHymn(hymnOfTheDay, screen);
                }}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-bold text-sm mb-2.5"
              >
                {tr("Open Hymn", "Ṣí Orin")}
              </button>

              <button
                onClick={() => setShowDevotional(false)}
                className="w-full py-2.5 text-muted-foreground text-sm font-medium"
              >
                {tr("Dismiss", "Pa")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const renderScreen = () => {
    switch (screen) {
      case "onboarding":
        return renderOnboarding();

      case "home":
        return renderHome();

      case "all-hymns":
        return renderAllHymns();

      case "hymn-detail":
        return renderHymnDetail();

      case "search":
        return renderSearch();

      case "categories":
        return renderCategories();

      case "category-detail":
        return renderCategoryDetail();

      case "favorites":
        return renderFavorites();

      case "settings":
        return renderSettings();

      default:
        return renderHome();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #1a237e 0%, #283593 40%, #1565c0 100%)",
      }}
    >
      <div
        className="relative w-full max-w-[393px] h-screen max-h-[852px] bg-background overflow-hidden flex flex-col md:rounded-[44px] md:shadow-2xl"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* {screen !== "onboarding" && <StatusBar />} */}
        {screen !== "onboarding" && <StatusBar isOnline={isOnline} />}

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{
                opacity: 0,
                x:
                  screen === "hymn-detail"
                    ? 24
                    : screen === "onboarding"
                      ? 0
                      : -8,
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0,
                x: screen === "hymn-detail" ? -24 : 8,
              }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex-1 flex flex-col overflow-hidden min-h-0"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* {showBottomNav && <BottomNav />} */}
        {showBottomNav && (
          <BottomNav
            activeTab={activeTab}
            language={language}
            favoritesCount={favorites.length}
            onNavigate={navigateTab}
          />
        )}

        {screen !== "onboarding" && <DevotionalModal />}
      </div>
    </div>
  );
}