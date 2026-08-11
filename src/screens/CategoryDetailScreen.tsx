import React from "react";

import { ChevronRight, Heart } from "lucide-react";

import { useHymnal } from "../app/hymnalContext";

import { displayHymnNumber } from "../lib/hymnUtils";

export default function CategoryDetailScreen() {
  const {
    hymns,
    selectedCategory,
    openHymn,
    hymnTitle,
    hymnOtherTitle,
    favorites,
  } = useHymnal();

  if (!selectedCategory) return null;

  const catHymns = hymns.filter(
    (h) => h.category === selectedCategory.id
  );

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 overflow-y-auto pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="divide-y divide-border">
          {catHymns.map((hymn) => (
            <button
              key={hymn.id}
              onClick={() => void openHymn(hymn, "category-detail")}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors text-left"
            >
              <span
                className="font-black text-sm w-10 flex-shrink-0"
                style={{ color: "#D4A017" }}
              >
                {displayHymnNumber(hymn)}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-semibold truncate">
                  {hymnTitle(hymn)}
                </p>

                <p className="text-muted-foreground text-[11px] truncate">
                  {hymnOtherTitle(hymn)}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {favorites.includes(hymn.id) && (
                  <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />
                )}

                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
