import { useState, useEffect } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    /**
     * The deferred `beforeinstallprompt` event, exposed by the catcher in
     * `main.tsx` so the React hook can pick it up even if the event fired
     * before the React tree mounted (race on slow devices).
     */
    __deferredInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

const DISMISS_KEY = "pwa-install-dismissed";
// Dismissals expire so the install banner can come back on later visits —
// a permanent flag made the button "disappear forever" after one tap.
const DISMISS_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function readDismissState(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (!Number.isFinite(ts)) return false; // legacy "true" value → treat as not dismissed
    if (Date.now() - ts > DISMISS_EXPIRY_MS) {
      localStorage.removeItem(DISMISS_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function useInstallPrompt() {
  // Initialize from the shared window store so a prompt captured before React
  // mounted (module-scope catcher in main.tsx) is not lost.
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(
      () => window.__deferredInstallPrompt ?? null,
    );
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(readDismissState);

  useEffect(() => {
    const isStandaloneMode = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    setIsStandalone(isStandaloneMode);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    const adoptPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      window.__deferredInstallPrompt = e;
      // A fresh installable event means the user is allowed to install again,
      // so an old dismissal should no longer hide the button.
      setIsDismissed(false);
      setDeferredPrompt(e);
    };

    // Custom event dispatched from the module-scope catcher in main.tsx.
    const handlePwaReady = (e: Event) => {
      adoptPrompt((e as CustomEvent<BeforeInstallPromptEvent>).detail);
    };

    // Direct listener as a fallback — catches the event on any path where
    // main.tsx's module-scope listener wasn't registered in time.
    const handleBeforeInstall = (e: Event) => {
      adoptPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      window.__deferredInstallPrompt = null;
      setDeferredPrompt(null);
      setIsStandalone(true);
      try {
        localStorage.removeItem(DISMISS_KEY);
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("pwa-install-ready", handlePwaReady);
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("pwa-install-ready", handlePwaReady);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    const prompt = deferredPrompt ?? window.__deferredInstallPrompt;
    if (!prompt) return false;

    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      // The prompt is consumed once shown — clear it on ANY outcome so the
      // banner never lingers with a dead button after the native dialog was
      // dismissed (a second prompt() call would throw and silently fail).
      window.__deferredInstallPrompt = null;
      setDeferredPrompt(null);
      if (outcome === "accepted") {
        return true;
      }
    } catch (err) {
      // `prompt()`/`userChoice` can reject if the prompt was already consumed
      // or the event was invalidated — the browser menu install still works.
      console.error("Install prompt failed:", err);
    }
    return false;
  };

  const dismissPrompt = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  return {
    isIOS,
    isStandalone,
    isDismissed,
    deferredPrompt,
    installApp,
    dismissPrompt,
  };
}
