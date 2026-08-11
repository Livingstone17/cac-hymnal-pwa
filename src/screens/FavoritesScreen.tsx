import React from "react";

import { motion } from "motion/react";

import { Heart, Trash2, GripVertical } from "lucide-react";

import { useHymnal } from "../app/hymnalContext";

import { displayHymnNumber } from "../lib/hymnUtils";

export default function FavoritesScreen() {
  const {
    tr,
    favoriteHymns,
    navigateTab,
    swipedFavId,
    setSwipedFavId,
    openHymn,
    hymnTitle,
    hymnCategoryName,
    toggleFavorite,
  } = useHymnal();

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 overflow-y-auto pt-3 pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        {favoriteHymns.length === 0 ? (
          <div className="pt-20 text-center px-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#FFF0F0" }}
            >
              <Heart className="w-9 h-9 text-red-200" />
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
              onClick={() => navigateTab("search")}
              className="mt-5 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              {tr("Find Hymns", "Ìwádìí Orin")}
            </button>
          </div>
        ) : (
          <div className="px-4 space-y-2">
            {favoriteHymns.map((hymn) => (
              <div key={hymn.id} className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4 rounded-2xl">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>

                <motion.div
                  animate={{ x: swipedFavId === hymn.id ? -76 : 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 32 }}
                  className="relative bg-card border border-border rounded-2xl"
                >
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                    <span
                      className="font-black text-sm w-10 flex-shrink-0"
                      style={{ color: "#D4A017" }}
                    >
                      {displayHymnNumber(hymn)}
                    </span>

                    <button
                      className="flex-1 min-w-0 text-left"
                      onClick={() =>
                        swipedFavId === hymn.id
                          ? setSwipedFavId(null)
                          : void openHymn(hymn, "favorites")
                      }
                    >
                      <p className="text-foreground text-sm font-semibold truncate">
                        {hymnTitle(hymn)}
                      </p>

                      <p className="text-muted-foreground text-[11px] capitalize truncate">
                        {hymnCategoryName(hymn)}
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        setSwipedFavId(
                          swipedFavId === hymn.id ? null : hymn.id
                        )
                      }
                      className="flex-shrink-0 p-1"
                    >
                      <Heart className="w-5 h-5 text-red-400 fill-current" />
                    </button>
                  </div>
                </motion.div>

                {swipedFavId === hymn.id && (
                  <button
                    onClick={() => {
                      toggleFavorite(hymn.id);
                      setSwipedFavId(null);
                    }}
                    className="absolute right-0 top-0 bottom-0 w-20"
                  />
                )}
              </div>
            ))}

            <p className="text-center text-xs text-muted-foreground pt-2">
              {tr("Tap heart to remove", "Tẹ ọkàn láti yọ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
