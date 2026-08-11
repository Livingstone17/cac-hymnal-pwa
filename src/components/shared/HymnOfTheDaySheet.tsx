import React from "react";

import { motion } from "motion/react";

import { Heart, Music, Star } from "lucide-react";

import { useHymnal } from "../../app/hymnalContext";

import { displayHymnNumber } from "../../lib/hymnUtils";

import BottomSheet from "./BottomSheet";

export default function HymnOfTheDaySheet() {
  const {
    tr,
    language,
    hymnOfTheDay,
    hymnOfTheDayDetail,
    hymnTitle,
    hymnCategoryName,
    showHymnOfTheDay,
    setShowHymnOfTheDay,
    openHymn,
    screen,
    favorites,
    toggleFavorite,
  } = useHymnal();

  if (!hymnOfTheDay) return null;

  const close = () => setShowHymnOfTheDay(false);
  const isFav = favorites.includes(hymnOfTheDay.id);
  const detail = hymnOfTheDayDetail;
  const previewVerses = detail?.verses.slice(0, 2) ?? [];
  const langLines = (en: string[], yo: string[]) =>
    language === "en" ? en : yo;

  return (
    <BottomSheet
      open={showHymnOfTheDay}
      onClose={close}
      closeLabel={tr("Close", "Pa")}
      header={
        <>
          {/* Featured chip + number + favorite */}
          <div className="flex items-center justify-between px-5 mt-1">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={{
                background: "rgba(212,160,23,0.15)",
                color: "#B8860B",
                border: "1px solid rgba(212,160,23,0.3)",
              }}
            >
              <Star className="w-3 h-3 fill-current" />
              {tr("Hymn of the Day", "Orin Ọjọ Oni")}
            </span>

            <div className="flex items-center gap-2.5">
              <span className="text-muted-foreground text-sm font-black">
                #{displayHymnNumber(hymnOfTheDay)}
              </span>

              <motion.button
                onClick={() => toggleFavorite(hymnOfTheDay.id)}
                animate={isFav ? { scale: [1, 1.3, 0.9, 1.15, 1] } : {}}
                transition={{ duration: 0.45 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isFav
                    ? "bg-red-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
              </motion.button>
            </div>
          </div>

          {/* Title + category */}
          <div className="px-5 mt-1.5">
            <h3 className="text-[22px] font-bold text-foreground leading-snug">
              {hymnTitle(hymnOfTheDay)}
            </h3>

            <p className="text-muted-foreground text-xs mt-1 capitalize">
              {hymnCategoryName(hymnOfTheDay)}
            </p>
          </div>
        </>
      }
      footer={
        <div className="px-5 mt-4">
          <button
            onClick={() => {
              close();
              void openHymn(hymnOfTheDay, screen);
            }}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Music className="w-4 h-4" />
            {tr("Sing Now", "Korin Báyìí")}
          </button>

          <button
            onClick={close}
            className="w-full py-2.5 text-muted-foreground text-sm font-medium mt-1"
          >
            {tr("Dismiss", "Pa")}
          </button>
        </div>
      }
    >
      {/* Lyrics preview */}
      <div className="px-5 mt-4 pb-2">
        {previewVerses.length > 0 ? (
          previewVerses.map((verse) => (
            <div key={verse.number} className="mb-4">
              <p
                className="text-[10px] font-black uppercase tracking-[0.15em] mb-1.5"
                style={{ color: "#D4A017" }}
              >
                {tr("Verse", "Ẹsẹ")} {verse.number}
              </p>

              <div className="space-y-1">
                {langLines(verse.en, verse.yo).map((line, i) => (
                  <p key={i} className="text-foreground text-[15px] leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm italic">
            {tr("Loading lyrics…", "Ń gba àwọn orin…")}
          </p>
        )}

        {detail?.chorus && (
          <div
            className="rounded-2xl p-4 mb-2"
            style={{
              background: "rgba(26,35,126,0.05)",
              border: "1px solid rgba(26,35,126,0.12)",
            }}
          >
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.15em] mb-1.5">
              {tr("Chorus", "Orin Àárín")}
            </p>

            <div className="space-y-1">
              {langLines(detail.chorus.en, detail.chorus.yo).map((line, i) => (
                <p key={i} className="text-foreground text-[15px] italic leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
