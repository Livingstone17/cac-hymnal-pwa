import React from "react";
import { useInstallPrompt } from "../lib/useInstallPrompt";

export default function InstallPrompt() {
  const {
    isIOS,
    isStandalone,
    isDismissed,
    deferredPrompt,
    installApp,
    dismissPrompt,
  } = useInstallPrompt();

  if (isStandalone || isDismissed) {
    return null;
  }

  // iOS: show the "Add to Home Screen" instructions card.
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
        <button
          onClick={dismissPrompt}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        <h3 className="text-lg font-bold mb-2 pr-6">Install CAC Gospel Hymnal</h3>
        <p className="text-sm text-gray-600 mb-3">
          To install this app on your iPhone or iPad, tap the Share button at
          the bottom of your screen, then scroll down and tap "Add to Home
          Screen".
        </p>
      </div>
    );
  }

  // Android / desktop: only show the button once the browser has granted a
  // real installable prompt. If `beforeinstallprompt` hasn't fired, the
  // browser's own menu (Add to Home screen / Install app) still works, so a
  // dead button would only mislead users.
  if (!deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 flex items-center justify-between">
      <button
        onClick={dismissPrompt}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold"
        aria-label="Close"
      >
        &times;
      </button>
      <div className="pr-8">
        <h3 className="text-lg font-bold">Install App</h3>
        <p className="text-sm text-gray-600">
          Add to your home screen for offline access.
        </p>
      </div>
      <button
        onClick={installApp}
        className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
      >
        Install
      </button>
    </div>
  );
}
