import React from "react";

import { useHymnal } from "../app/hymnalContext";

export default function CategoriesScreen() {
  const { tr, language, categories, setSelectedCategory, setScreen } =
    useHymnal();

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 overflow-y-auto px-4 pt-3 pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const { Icon } = cat;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setScreen("category-detail");
                }}
                className="bg-card border border-border rounded-2xl p-4 text-left active:scale-95 transition-all hover:border-primary/20"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: cat.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: cat.color }} />
                </div>

                <p className="font-bold text-foreground text-[13px] line-clamp-2 leading-snug">
                  {language === "en" ? cat.nameEn : cat.nameYo}
                </p>

                <p className="text-muted-foreground text-xs mt-0.5">
                  {cat.hymnCount} {tr("hymns", "orin")}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
