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
createRoot(document.getElementById("root")!).render(<App />);
