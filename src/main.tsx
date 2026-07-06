
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// --- PWA INSTALL PROMPT CATCHER ---
let deferredPrompt: any = null;
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Dispatch a custom event so our React hook can catch it
    window.dispatchEvent(new CustomEvent("pwa-install-ready", { detail: e }));
});
// ----------------------------------
createRoot(document.getElementById("root")!).render(<App />);
