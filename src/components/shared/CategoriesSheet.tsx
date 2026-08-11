import React, { useMemo, useState } from "react";

import { ArrowUpRight, Grid3X3, Search, X } from "lucide-react";

import { useHymnal } from "../../app/hymnalContext";

import BottomSheet from "./BottomSheet";

const stripDiacritics = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function CategoriesSheet() {
  const {
    tr,
    language,
    categories,
    showCategoriesSheet,
    setShowCategoriesSheet,
    setSelectedCategory,
    setScreen,
    navigateTab,
  } = useHymnal();

  const [query, setQuery] = useState("");

  const close = () => setShowCategoriesSheet(false);

  const q = stripDiacritics(query.trim());

  const visible = useMemo(() => {
    if (!q) return categories;
    return categories.filter(
      (cat) =>
        stripDiacritics(cat.nameEn).includes(q) ||
        stripDiacritics(cat.nameYo).includes(q)
    );
  }, [categories, q]);

  const openCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setSelectedCategory(cat);
    setShowCategoriesSheet(false);
    setScreen("category-detail");
  };

  return (
    <BottomSheet
      open={showCategoriesSheet}
      onClose={close}
      closeLabel={tr("Close", "Pa")}
      header={
        <>
          {/* Title row */}
          <div className="flex items-center justify-between px-5 mt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(46,125,50,0.12)" }}
              >
                <Grid3X3 className="w-5 h-5" style={{ color: "#2E7D32" }} />
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-bold text-foreground leading-tight">
                  {tr("Categories", "Àwọn Ẹ̀ka")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {categories.length} {tr("categories", "ẹ̀ka")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => {
                  close();
                  navigateTab("categories");
                }}
                className="flex items-center gap-1 text-xs font-semibold text-primary"
              >
                {tr("View all", "Wo gbogbo")}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={close}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                aria-label={tr("Close", "Pa")}
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="px-5 pt-3 pb-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr("Filter categories…", "Ṣíṣẹ̀dá ẹ̀ka…")}
                className="w-full pl-10 pr-9 py-2.5 bg-muted rounded-xl text-sm
                           text-foreground placeholder:text-muted-foreground
                           outline-none focus:ring-2"
                style={
                  { "--tw-ring-color": "rgba(26,35,126,0.25)" } as React.CSSProperties
                }
              />

              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center"
                  aria-label={tr("Clear", "Parẹ́")}
                >
                  <X className="w-3 h-3 text-foreground" />
                </button>
              )}
            </div>
          </div>
        </>
      }
    >
      {/* Category grid */}
      <div className="px-5 pt-2 pb-2">
        {visible.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            {tr("No categories found", "Kò sí ẹ̀ka")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {visible.map((cat) => {
              const { Icon } = cat;

              return (
                <button
                  key={cat.id}
                  onClick={() => openCategory(cat.id)}
                  className="bg-muted/40 border border-border rounded-2xl p-3.5 text-left active:scale-95 transition-all hover:border-primary/20"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5"
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
        )}
      </div>
    </BottomSheet>
  );
}
