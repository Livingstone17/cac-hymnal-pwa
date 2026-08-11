import React, { useState } from "react";

import { motion } from "motion/react";

import { useHymnal } from "../app/hymnalContext";

import { LS_ONBOARDED } from "../constants/hymnal";

import { loadLanguage, saveLocal } from "../lib/localStorage";

import type { Language } from "../types/hymnal";

import logo from "../assets/logo.png";

export default function OnboardingScreen() {
  const { setLanguage, setSettingsLang, setScreen, setActiveTab } = useHymnal();

  const [onboardLang, setOnboardLang] = useState<Language>(() =>
    loadLanguage()
  );

  return (
    <div
      className="flex flex-col h-full relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #1A237E 0%, #283593 60%, #1565C0 100%)",
        paddingTop: "env(safe-area-inset-top, 0px)",
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
          <img
            src={logo}
            alt=""
            width={60}
            height={40}
            style={{ width: 60, height: 40 }}
          />
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
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                  onboardLang === lang
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
        className="relative px-6"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)" }}
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
}
