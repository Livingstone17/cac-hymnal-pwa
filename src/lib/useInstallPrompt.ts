// import { useState, useEffect } from "react";

// export function useInstallPrompt() {
//     const [deferredPrompt, setDeferredPrompt] = useState(null);
//     const [isIOS, setIsIOS] = useState(false);
//     const [isStandalone, setIsStandalone] = useState(false);

//     useEffect(() => {
//         // Check if the app is already installed
//         const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;
//         setIsStandalone(isStandaloneMode);

//         // Detect iOS devices
//         const userAgent = window.navigator.userAgent.toLowerCase();
//         const iosDevice = /iphone|ipad|ipod/.test(userAgent);
//         setIsIOS(iosDevice);

//         // Listen for the beforeinstallprompt event (Android and Desktop)
//         const handleBeforeInstall = (e) => {
//             e.preventDefault();
//             setDeferredPrompt(e);
//         };

//         window.addEventListener("beforeinstallprompt", handleBeforeInstall);

//         // Listen for appinstalled event to hide the prompt after installation
//         const handleAppInstalled = () => {
//             setDeferredPrompt(null);
//             setIsStandalone(true);
//         };

//         window.addEventListener("appinstalled", handleAppInstalled);

//         return () => {
//             window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
//             window.removeEventListener("appinstalled", handleAppInstalled);
//         };
//     }, []);

//     const installApp = async () => {
//         if (!deferredPrompt) return;

//         // Show the native install prompt
//         deferredPrompt.prompt();

//         // Wait for the user to respond to the prompt
//         const { outcome } = await deferredPrompt.userChoice;

//         if (outcome === "accepted") {
//             setDeferredPrompt(null);
//         }
//     };

//     return { isIOS, isStandalone, deferredPrompt, installApp };
// }

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      return;
    }

    const isStandaloneMode = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    setIsStandalone(isStandaloneMode);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Listen for the custom event dispatched from main.tsx
    const handlePwaReady = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent>;
      setDeferredPrompt(customEvent.detail);
    };

    window.addEventListener("pwa-install-ready", handlePwaReady);

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      localStorage.removeItem("pwa-install-dismissed");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("pwa-install-ready", handlePwaReady);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const dismissPrompt = () => {
    setIsDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
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
