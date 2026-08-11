import React, { useMemo } from "react";

import { motion, AnimatePresence } from "motion/react";

import {
  ChevronRight,
  FileText,
  RefreshCw,
  Share2,
  Heart,
  Loader2,
} from "lucide-react";

import { useHymnal } from "../app/hymnalContext";

import {
  displayHymnNumber,
  normalizeMeter,
} from "../lib/hymnUtils";

export default function HymnDetailScreen() {
  const {
    tr,
    hymnLang,
    hymns,
    selectedHymn,
    pendingHymn,
    hymnDetailLoading,
    hymnDetailError,
    hymnTitle,
    fontSize,
    metaExpanded,
    setMetaExpanded,
    openHymn,
    prevScreen,
    handleShareHymn,
    toggleFavorite,
    favorites,
    heartPulse,
  } = useHymnal();

  const headingHymn = selectedHymn ?? pendingHymn;
  const currentMeterKey = normalizeMeter(selectedHymn?.meter);

  const sameMeterHymns = useMemo(() => {
    if (!selectedHymn || !currentMeterKey) return [];

    return hymns.filter(
      (hymn) =>
        hymn.id !== selectedHymn.id &&
        normalizeMeter(hymn.meter) === currentMeterKey
    );
  }, [selectedHymn, hymns, currentMeterKey]);

  return (
    <div className="relative flex flex-col h-full">
      {hymnDetailLoading && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="font-semibold text-foreground">
            {tr("Loading hymn…", "Orin ń ṣí…")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {headingHymn ? hymnTitle(headingHymn) : ""}
          </p>
        </div>
      )}

      {!hymnDetailLoading && hymnDetailError && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-bold text-foreground mb-1">
            {tr("Could not load hymn", "A kò lè ṣí orin")}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {hymnDetailError}
          </p>
          {headingHymn && (
            <button
              onClick={() => void openHymn(headingHymn, prevScreen)}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {tr("Retry", "Gbìyànjú")}
            </button>
          )}
        </div>
      )}

      {!hymnDetailLoading && !hymnDetailError && selectedHymn && (
        <>
          <div
            className="flex-1 overflow-y-auto pb-20"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="px-5 pt-5 pb-4">
              <motion.h1
                key={hymnLang + selectedHymn.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="text-[22px] font-bold text-foreground leading-snug"
              >
                {hymnTitle(selectedHymn, hymnLang)}
              </motion.h1>

              <p className="text-muted-foreground text-xs mt-1.5 font-medium">
                {hymnLang === "en"
                  ? `Category: ${selectedHymn.categoryEn}`
                  : `Isori: ${selectedHymn.categoryYo}`}
              </p>
              <p className="text-muted-foreground text-xs mt-1.5 font-medium">
                {selectedHymn.meter
                  ? `Meter: ${selectedHymn.meter}`
                  : "Hymn Meter unknown"}
              </p>
            </div>

            <div className="px-5 space-y-7">
              {selectedHymn.verses.map((verse) => (
                <motion.div
                  key={`${verse.number}-${hymnLang}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: verse.number * 0.03 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-[10px] font-black uppercase tracking-[0.15em]"
                      style={{ color: "#D4A017" }}
                    >
                      {tr("Verse", "Ẹsẹ")} {verse.number}
                    </span>

                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="space-y-2">
                    {(hymnLang === "en" ? verse.en : verse.yo).map(
                      (line, i) => (
                        <p
                          key={i}
                          className="text-foreground leading-[1.8]"
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {line}
                        </p>
                      )
                    )}
                  </div>
                </motion.div>
              ))}

              {selectedHymn.chorus && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(26,35,126,0.05)",
                    border: "1px solid rgba(26,35,126,0.12)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">
                      {tr("Chorus", "Orin Àárín")}
                    </span>

                    <div
                      className="flex-1 h-px"
                      style={{ background: "rgba(26,35,126,0.15)" }}
                    />
                  </div>

                  <div className="space-y-2">
                    {(
                      hymnLang === "en"
                        ? selectedHymn.chorus.en
                        : selectedHymn.chorus.yo
                    ).map((line, i) => (
                      <p
                        key={i}
                        className="text-foreground leading-[1.8] font-medium italic"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="mx-5 mt-7 mb-4 border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setMetaExpanded(!metaExpanded)}
                className="w-full flex items-center justify-between px-4 py-3.5"
              >
                <span className="text-sm font-semibold text-foreground">
                  {tr("Hymn Details", "Àlàyé Orin")}
                </span>

                <ChevronRight
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                    metaExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {metaExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border px-4 pb-4 pt-3 space-y-2.5">
                      {[
                        {
                          label: tr("Category", "Ẹ̀ka"),
                          value:
                            hymnLang === "en"
                              ? selectedHymn.categoryEn
                              : selectedHymn.categoryYo,
                        },
                        {
                          label: tr("Hymn Number", "Nọ́mbà Orin"),
                          value: `#${displayHymnNumber(selectedHymn)}`,
                        },
                        {
                          label: tr("Type", "Irú"),
                          value: selectedHymn.hymnType,
                        },
                        {
                          label: tr("Meter", "Mítà"),
                          value: selectedHymn.meter ?? "—",
                        },
                        {
                          label: tr("Scripture", "Ìwé Mímọ́"),
                          value: selectedHymn.scripture ?? "—",
                        },
                        {
                          label: tr("Verses", "Àwọn Ẹsẹ"),
                          value: String(selectedHymn.verses.length),
                        },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex justify-between items-center gap-4"
                        >
                          <span className="text-xs text-muted-foreground">
                            {row.label}
                          </span>

                          <span className="text-xs font-semibold text-foreground capitalize text-right">
                            {row.value}
                          </span>
                        </div>
                      ))}
                      {selectedHymn.meter && sameMeterHymns.length > 0 && (
                        <div className="pt-3 mt-3 border-t border-border">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="text-xs text-muted-foreground">
                              {tr(
                                "Other Hymns with same Meter as this",
                                "Àwọn Orin miran toni Mítà Kanna pelu orin yi"
                              )}
                            </span>

                            <span className="text-xs font-semibold text-foreground">
                              {sameMeterHymns.length} {tr("found", "rí")}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {sameMeterHymns.slice(0, 12).map((hymn) => (
                              <button
                                key={hymn.id}
                                onClick={() => void openHymn(hymn, prevScreen)}
                                className="max-w-full px-2.5 py-1.5 rounded-full bg-muted border border-border text-[11px] font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                                title={hymnTitle(hymn)}
                              >
                                #{displayHymnNumber(hymn)} ·{" "}
                                <span className="inline-block max-w-[130px] truncate align-bottom">
                                  {hymnTitle(hymn)}
                                </span>
                              </button>
                            ))}
                          </div>

                          {sameMeterHymns.length > 12 && (
                            <p className="text-[11px] text-muted-foreground mt-2">
                              +{sameMeterHymns.length - 12}{" "}
                              {tr(
                                "more hymns with this meter",
                                "miiran pẹ̀lú mítà yìí"
                              )}
                            </p>
                          )}
                        </div>
                      )}
                      <button
                        onClick={handleShareHymn}
                        className="w-full mt-2 flex items-center justify-center gap-2 bg-muted py-2.5 rounded-xl text-sm font-semibold text-foreground"
                      >
                        <Share2 className="w-4 h-4" />
                        {tr("Share Hymn", "Pín Orin")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute bottom-5 right-5 z-10">
            <motion.button
              onClick={() => toggleFavorite(selectedHymn.id)}
              animate={
                heartPulse && favorites.includes(selectedHymn.id)
                  ? { scale: [1, 1.35, 0.85, 1.12, 1] }
                  : {}
              }
              transition={{ duration: 0.55 }}
              className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors ${
                favorites.includes(selectedHymn.id)
                  ? "bg-red-500 text-white"
                  : "bg-card border border-border text-muted-foreground"
              }`}
            >
              <Heart
                className={`w-6 h-6 transition-all ${
                  favorites.includes(selectedHymn.id) ? "fill-current" : ""
                }`}
              />
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}
