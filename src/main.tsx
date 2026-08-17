import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import type { BeforeInstallPromptEvent } from "./lib/useInstallPrompt";

// --- PWA INSTALL PROMPT CATCHER ---
// Chrome fires `beforeinstallprompt` once the app meets the installability
// criteria (HTTPS, valid manifest, controlling service worker, user
// engagement). We prevent the default mini-infobar so our own button can
// trigger the native install dialog, and we store the deferred prompt on
// `window` so the React hook can use it even if the event fired before the
// React tree mounted.
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  const event = e as BeforeInstallPromptEvent;
  window.__deferredInstallPrompt = event;
  // Notify any live React hook instances.
  window.dispatchEvent(new CustomEvent("pwa-install-ready", { detail: event }));
});

window.addEventListener("appinstalled", () => {
  window.__deferredInstallPrompt = null;
});
// ----------------------------------

// --- PWA AUTO-UPDATE: force installed apps onto the newest bundle ---
// The service worker is configured with skipWaiting + clientsClaim, so a new
// SW installs and takes control automatically. But the page that is already
// open keeps running the OLD JavaScript bundle until it is reloaded — which
// is exactly why installed users kept seeing old lyrics after a deploy.
//
// When the controlling service worker changes, reload the page (deferred
// until the app is visible again if it is currently in the background) so
// the latest app code + hymn data are used. The very first activation (fresh
// install, no previous SW) is not an update and is ignored.
if ("serviceWorker" in navigator) {
  const wasControlled = navigator.serviceWorker.controller !== null;

  const reloadForUpdate = () => {
    if (document.visibilityState === "visible") {
      window.location.reload();
    } else {
      document.addEventListener(
        "visibilitychange",
        () => {
          if (document.visibilityState === "visible") {
            window.location.reload();
          }
        },
        { once: true }
      );
    }
  };

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!wasControlled) return;
    reloadForUpdate();
  });
}
// ----------------------------------
createRoot(document.getElementById("root")!).render(<App />);
