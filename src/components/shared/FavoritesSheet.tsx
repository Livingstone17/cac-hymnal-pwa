import React from "react";

import { Heart, X } from "lucide-react";

import { useHymnal } from "../../app/hymnalContext";

import { displayHymnNumber } from "../../lib/hymnUtils";

import BottomSheet from "./BottomSheet";

export default function FavoritesSheet() {
  const {
    tr,
    favoriteHymns,
    showFavoritesSheet,
    setShowFavoritesSheet,
    openHymn,
    hymnTitle,
    hymnCategoryName,
    toggleFavorite,
    navigateTab,
  } = useHymnal();

  const close = () => setShowFavoritesSheet(false);

  return (
    <BottomSheet
      open={showFavoritesSheet}
      onClose={close}
      closeLabel={tr("Close", "Pa")}
      header={
        <div className="flex items-center justify-between px-5 mt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#FFEBEE" }}
            >
              <Heart className="w-5 h-5" style={{ color: "#C62828" }} />
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-bold text-foreground leading-tight">
                {tr("Favorites", "Àyọ̀ Mi")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {favoriteHymns.length} {tr("saved hymns", "orin tí a pamọ́")}
              </p>
            </div>
          </div>

          <button
            onClick={close}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
            aria-label={tr("Close", "Pa")}
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>
      }
    >
      {favoriteHymns.length === 0 ? (
        <div className="pt-14 text-center px-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: "#FFF0F0" }}
          >
            <Heart className="w-7 h-7 text-red-200" />
          </div>

          <p className="font-bold text-foreground text-base mb-1">
            {tr("No favorites yet", "Ko sí orin ayọ̀")}
          </p>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {tr(
              "Tap the heart icon while reading a hymn.",
              "Tẹ àmi ọkàn nígbà tí o bá ń ka orin."
            )}
          </p>

          <button
            onClick={() => {
              close();
              navigateTab("search");
            }}
            className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            {tr("Find Hymns", "Ìwádìí Orin")}
          </button>
        </div>
      ) : (
        <div className="px-5 pt-2 pb-2 space-y-2">
          {favoriteHymns.map((hymn) => (
            <div
              key={hymn.id}
              className="flex items-center gap-3 bg-muted/40 border border-border rounded-2xl px-4 py-3"
            >
              <span
                className="font-black text-sm w-10 flex-shrink-0"
                style={{ color: "#D4A017" }}
              >
                {displayHymnNumber(hymn)}
              </span>

              <button
                className="flex-1 min-w-0 text-left"
                onClick={() => {
                  close();
                  void openHymn(hymn, "home");
                }}
              >
                <p className="text-foreground text-sm font-semibold truncate">
                  {hymnTitle(hymn)}
                </p>

                <p className="text-muted-foreground text-[11px] capitalize truncate">
                  {hymnCategoryName(hymn)}
                </p>
              </button>

              <button
                onClick={() => toggleFavorite(hymn.id)}
                className="flex-shrink-0 p-1"
                aria-label={tr("Remove", "Yọ")}
              >
                <Heart className="w-5 h-5 text-red-400 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
