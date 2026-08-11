import React from "react";

import {
  Globe,
  DownloadCloud,
  Bell,
  Clock,
  FileText,
  Moon,
  Sun,
  Info,
  Trash2,
  BookOpen,
  Loader2,
} from "lucide-react";

import { useHymnal } from "../app/hymnalContext";

import SettingsSection from "../components/shared/SettingSection";
import Toggle from "../components/shared/Toggle";

import { detectBrowserLanguage } from "../lib/localStorage";

const supportEmail = "peterson.omobolaji@gmail.com";
const churchName = "CAC ITEDO YIYANJU District";

export default function SettingsScreen() {
  const {
    tr,
    settingsLang,
    setSettingsLang,
    setLanguage,
    hymns,
    isOnline,
    darkMode,
    setDarkMode,
    fontSize,
    setFontSize,
    reminderEnabled,
    setReminderEnabled,
    reminderTime,
    setReminderTime,
    offlineReady,
    offlineDownload,
    offlineDownloadError,
    handleDownloadAll,
    handleClearAllData,
  } = useHymnal();

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 overflow-y-auto pt-3 pb-6 space-y-3 px-4"
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
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    settingsLang === val
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

        <SettingsSection
          title={tr("Offline Hymns", "Orin Laini Ayelujara")}
          icon={DownloadCloud}
        >
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
                    ? tr(
                        "Offline hymns ready",
                        "Àwọn orin ti ṣetan laini ayelujara"
                      )
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
              className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 ${
                offlineDownload?.running
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
                  ? tr(
                      "Refresh offline hymns",
                      "Ṣe imudojuiwọn orin offline"
                    )
                  : tr(
                      "Download hymns for offline use",
                      "Ṣe igbasilẹ orin fun offline"
                    )}
            </button>

            {offlineDownload && (
              <div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${
                        offlineDownload.total
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

        <SettingsSection
          title={tr("Devotional Reminder", "Ìránilétí Ìjọ̀sìn")}
          icon={Bell}
        >
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

        <SettingsSection
          title={tr("Lyrics Font Size", "Iwọn Àkọ́ Orin")}
          icon={FileText}
        >
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

        <SettingsSection
          title={tr("Appearance", "Àwòrán")}
          icon={darkMode ? Moon : Sun}
        >
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
              [
                tr("Total Hymns", "Àpapọ̀ Orin"),
                hymns.length ? String(hymns.length) : "—",
              ],
              [tr("Languages", "Àwọn Èdè"), "English · Yorùbá"],
              [
                tr("Connection", "Ìbánisọ̀rọ̀"),
                isOnline ? tr("Online", "Online") : tr("Offline", "Offline"),
              ],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex justify-between items-center gap-4"
              >
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
          Built with Love for CAC congregations worldwide
        </p>
        <p className="text-center text-[11px] text-muted-foreground">
          ©CAC ITEDO YIYANJU District. All rights reserved.
        </p>
        <p className="text-center text-[11px] text-muted-foreground pb-2">
          Designed & Developed by Zaophos
        </p>
        {/* PWA Feedback & Support Links */}
        <div
          style={{
            gap: "0.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href={`mailto:${supportEmail}?subject=${encodeURIComponent(
              `${churchName} PWA App Support`
            )}`}
            style={{
              color: "#0066cc",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "12px",
            }}
          >
            Share Feedback
          </a>
          <span>•</span>
          <a
            href={`mailto:${supportEmail}?subject=${encodeURIComponent(
              `${churchName} PWA App Support`
            )}`}
            style={{
              color: "#CC5800",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "12px",
            }}
          >
            Report an Issue
          </a>
        </div>
      </div>
    </div>
  );
}
