import React, { lazy, Suspense, useEffect, useRef, useState } from "react";

import { motion, AnimatePresence } from "motion/react";

import { Loader2 } from "lucide-react";

import type { Screen } from "../types/hymnal";

import { HymnalProvider, useHymnal } from "./hymnalContext";

import BottomNav from "../components/layout/BottomNav";
import StatusBar from "../components/layout/Statusbar";
import AppBar from "../components/layout/AppBar";
import InstallPrompt from "./installPrompt";
import DevotionalModal from "../components/shared/DevotionalModal";
import HymnOfTheDaySheet from "../components/shared/HymnOfTheDaySheet";
import CategoriesSheet from "../components/shared/CategoriesSheet";
import FavoritesSheet from "../components/shared/FavoritesSheet";

import { useKeyboard } from "../lib/useKeyboard";

// ── Code-split screens ────────────────────────────────────────────────────────

const OnboardingScreen = lazy(() => import("../screens/OnboardingScreen"));
const HomeScreen = lazy(() => import("../screens/HomeScreen"));
const AllHymnsScreen = lazy(() => import("../screens/AllHymnsScreen"));
const HymnDetailScreen = lazy(() => import("../screens/HymnDetailScreen"));
const SearchScreen = lazy(() => import("../screens/SearchScreen"));
const CategoriesScreen = lazy(() => import("../screens/CategoriesScreen"));
const CategoryDetailScreen = lazy(
  () => import("../screens/CategoryDetailScreen")
);
const FavoritesScreen = lazy(() => import("../screens/FavoritesScreen"));
const SettingsScreen = lazy(() => import("../screens/SettingsScreen"));

const SCREEN_COMPONENTS: Record<Screen, React.ComponentType> = {
  onboarding: OnboardingScreen,
  home: HomeScreen,
  "all-hymns": AllHymnsScreen,
  "hymn-detail": HymnDetailScreen,
  search: SearchScreen,
  categories: CategoriesScreen,
  "category-detail": CategoryDetailScreen,
  favorites: FavoritesScreen,
  settings: SettingsScreen,
};

// ── Shell (inside provider) ──────────────────────────────────────────────────

function AppShell() {
  const {
    screen,
    showBottomNav,
    activeTab,
    language,
    favorites,
    navigateTab,
  } = useHymnal();

  const frameRef = useRef<HTMLDivElement | null>(null);
  const keyboard = useKeyboard();

  // Track the frame's real rendered height so we only compensate for the
  // keyboard when `dvh` did NOT already shrink the app (older iOS browsers).
  const [frameHeight, setFrameHeight] = useState(0);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const measure = () => setFrameHeight(el.clientHeight);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const keyboardCompensation = keyboard.isOpen
    ? Math.max(0, frameHeight - keyboard.visualHeight)
    : 0;

  const ActiveScreen = SCREEN_COMPONENTS[screen] ?? HomeScreen;

  return (
    <div
      className="h-dvh w-full flex items-center justify-center md:p-4"
      style={{
        background:
          "linear-gradient(135deg, #1a237e 0%, #283593 40%, #1565c0 100%)",
      }}
    >
      {/* Phone frame: fills the device on mobile; centered phone mockup on desktop */}
      <div
        ref={frameRef}
        className="relative w-full h-full max-w-[393px] flex flex-col bg-background overflow-hidden md:max-h-[852px] md:rounded-[44px] md:shadow-2xl"
        style={{
          fontFamily: "'Inter', sans-serif",
          paddingBottom: keyboardCompensation,
        }}
      >
        {/* ── Static top chrome (status bar + app bar) ── */}
        {screen !== "onboarding" && (
          <>
            <StatusBar />
            <AppBar />
          </>
        )}

        {/* ── Scrollable screen content ── */}
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
              <Suspense
                fallback={
                  <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                }
              >
                <ActiveScreen />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom nav: slides away while the keyboard is open so it never overlaps it ── */}
        {showBottomNav && (
          <div
            className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
              keyboard.isOpen
                ? "translate-y-full opacity-0 pointer-events-none"
                : "translate-y-0 opacity-100"
            }`}
          >
            <BottomNav
              activeTab={activeTab}
              language={language}
              favoritesCount={favorites.length}
              onNavigate={navigateTab}
            />
          </div>
        )}

        {screen !== "onboarding" && <DevotionalModal />}
        {screen === "home" && <HymnOfTheDaySheet />}
        {screen === "home" && <CategoriesSheet />}
        {screen === "home" && <FavoritesSheet />}
      </div>
      <InstallPrompt />
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <HymnalProvider>
      <AppShell />
    </HymnalProvider>
  );
}
