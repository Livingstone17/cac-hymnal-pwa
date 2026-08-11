import React from "react";

import { AnimatePresence, motion } from "motion/react";

import { useHymnal, getTimeGreeting } from "../../app/hymnalContext";

export default function DevotionalModal() {
  const {
    tr,
    language,
    hymnOfTheDay,
    hymnOfTheDayDetail,
    hymnTitle,
    hymnCategoryName,
    showDevotional,
    setShowDevotional,
    openHymn,
    screen,
  } = useHymnal();

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
              {tr(
                "Start your day with praise ✨",
                "Bẹ̀rẹ̀ ọjọ́ rẹ pẹ̀lú ìyin ✨"
              )}
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
}
