// import React from "react";

// import {
//     BookOpen,
//     ChevronLeft,
//     ChevronRight,
//     Heart,
//     Loader2,
// } from "lucide-react";

// import {
//     displayHymnNumber,
//     getHymnCategoryName,
//     getHymnTitle,
//     getOtherHymnTitle,
// } from "../lib/hymnUtils";

// import type { HymnSummary, Language } from "../types/hymnal";

// export default function AllHymnsScreen({
//     hymns,
//     favorites,
//     language,
//     onBack,
//     onOpenHymn,
// }: {
//     hymns: HymnSummary[];
//     favorites: number[];
//     language: Language;
//     onBack: () => void;
//     onOpenHymn: (hymn: HymnSummary) => void;
// }) {
//     const tr = (en: string, yo: string) => (language === "en" ? en : yo);

//     return (
//         <div className="flex flex-col h-full">
//             <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-border flex-shrink-0">
//                 <button
//                     onClick={onBack}
//                     className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
//                 >
//                     <ChevronLeft className="w-4 h-4 text-foreground" />
//                 </button>

//                 <div className="flex-1 min-w-0">
//                     <h2 className="text-base font-bold text-foreground">
//                         {tr("All Hymns", "Gbogbo Orin")}
//                     </h2>

//                     <p className="text-xs text-muted-foreground">
//                         {hymns.length} {tr("hymns listed serially", "orin ni títẹ̀lé")}
//                     </p>
//                 </div>

//                 <BookOpen className="w-5 h-5 text-primary" />
//             </div>

//             <div
//                 className="flex-1 overflow-y-auto pb-4"
//                 style={{ scrollbarWidth: "none" }}
//             >
//                 {hymns.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center h-full px-8 text-center">
//                         <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
//                         <p className="text-sm text-muted-foreground">
//                             {tr("Loading hymns…", "Ń ṣí àwọn orin…")}
//                         </p>
//                     </div>
//                 ) : (
//                     <div className="divide-y divide-border">
//                         {hymns.map((hymn) => (
//                             <button
//                                 key={hymn.id}
//                                 onClick={() => onOpenHymn(hymn)}
//                                 className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors text-left"
//                             >
//                                 <span
//                                     className="font-black text-sm w-12 flex-shrink-0"
//                                     style={{ color: "#D4A017" }}
//                                 >
//                                     {displayHymnNumber(hymn)}
//                                 </span>

//                                 <div className="flex-1 min-w-0">
//                                     <p className="text-foreground text-sm font-semibold truncate">
//                                         {getHymnTitle(hymn, language)}
//                                     </p>

//                                     <p className="text-muted-foreground text-[11px] truncate">
//                                         {getOtherHymnTitle(hymn, language)}
//                                     </p>

//                                     <p className="text-muted-foreground text-[10px] truncate mt-0.5">
//                                         {getHymnCategoryName(hymn, language)}
//                                     </p>
//                                 </div>

//                                 <div className="flex items-center gap-1.5">
//                                     {favorites.includes(hymn.id) && (
//                                         <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />
//                                     )}

//                                     <ChevronRight className="w-4 h-4 text-muted-foreground" />
//                                 </div>
//                             </button>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

import React, { useMemo, useState } from "react";

import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Heart,
    Loader2,
    Search,
    X,
} from "lucide-react";

import {
    displayHymnNumber,
    getHymnCategoryName,
    getHymnTitle,
    getOtherHymnTitle,
} from "../lib/hymnUtils";

import type { HymnSummary, Language } from "../types/hymnal";

export default function AllHymnsScreen({
    hymns,
    favorites,
    language,
    onBack,
    onOpenHymn,
}: {
    hymns: HymnSummary[];
    favorites: number[];
    language: Language;
    onBack: () => void;
    onOpenHymn: (hymn: HymnSummary) => void;
}) {
    const tr = (en: string, yo: string) => (language === "en" ? en : yo);
    const [searchQuery, setSearchQuery] = useState("");

    const q = searchQuery.trim().toLowerCase();

    // Filter hymns locally when a query is typed.
    // Matches against: number, english title, yoruba title, english category, yoruba category.
    const visibleHymns = useMemo(() => {
        if (!q) return hymns;
        return hymns.filter((h) => {
            const numStr = String(h.number);
            return (
                numStr.includes(q) ||
                h.titleEn.toLowerCase().includes(q) ||
                h.titleYo.toLowerCase().includes(q) ||
                (h.categoryEn || "").toLowerCase().includes(q) ||
                (h.categoryYo || "").toLowerCase().includes(q)
            );
        });
    }, [hymns, q]);

    const isSearching = q.length > 0;

    return (
        <div className="flex flex-col h-full bg-background">
            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-border flex-shrink-0">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
                >
                    <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>

                <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-foreground">
                        {tr("All Hymns", "Gbogbo Orin")}
                    </h2>

                    <p className="text-xs text-muted-foreground">
                        {isSearching
                            ? `${visibleHymns.length} / ${hymns.length} ${tr(
                                "matches",
                                "àbájáde"
                            )}`
                            : `${hymns.length} ${tr(
                                "hymns listed serially",
                                "orin ni títẹ̀lé"
                            )}`}
                    </p>
                </div>

                <BookOpen className="w-5 h-5 text-primary" />
            </div>

            {/* ── Search box (NEW) ── */}
            <div className="px-5 pt-3 pb-2 flex-shrink-0">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={tr(
                            "Filter by number, title, or category…",
                            "Ṣíṣẹ̀dá nípasẹ̀ nọ́mbà, àkọlé, tàbí ẹ̀ka…"
                        )}
                        className="w-full pl-10 pr-9 py-2.5 bg-muted rounded-xl text-sm
                                   text-foreground placeholder:text-muted-foreground
                                   outline-none focus:ring-2 transition"
                        style={{ "--tw-ring-color": "rgba(26,35,126,0.25)" } as React.CSSProperties}
                    />

                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2
                                       w-5 h-5 rounded-full bg-muted-foreground/20
                                       flex items-center justify-center
                                       hover:bg-muted-foreground/30 transition"
                            aria-label="Clear search"
                        >
                            <X className="w-3 h-3 text-foreground" />
                        </button>
                    )}
                </div>
            </div>

            {/* ── List ── */}
            <div
                className="flex-1 overflow-y-auto pb-4"
                style={{ scrollbarWidth: "none" }}
            >
                {hymns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                        <p className="text-sm text-muted-foreground">
                            {tr("Loading hymns…", "Ń ṣí àwọn orin…")}
                        </p>
                    </div>
                ) : visibleHymns.length === 0 ? (
                    // Empty state for "search had no results"
                    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-3">
                            <Search className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="font-bold text-foreground mb-1">
                            {tr("No hymns found", "Kò sí orin")}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            {tr(
                                "Try a different number, title, or category.",
                                "Gbiyanju nọ́mbà, àkọlé, tàbí ẹ̀ka mìíràn."
                            )}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {visibleHymns.map((hymn) => (
                            <button
                                key={hymn.id}
                                onClick={() => onOpenHymn(hymn)}
                                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors text-left"
                            >
                                <span
                                    className="font-black text-sm w-12 flex-shrink-0"
                                    style={{ color: "#D4A017" }}
                                >
                                    {displayHymnNumber(hymn)}
                                </span>

                                <div className="flex-1 min-w-0">
                                    <p className="text-foreground text-sm font-semibold truncate">
                                        {getHymnTitle(hymn, language)}
                                    </p>

                                    <p className="text-muted-foreground text-[11px] truncate">
                                        {getOtherHymnTitle(hymn, language)}
                                    </p>

                                    <p className="text-muted-foreground text-[10px] truncate mt-0.5">
                                        {getHymnCategoryName(hymn, language)}
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
                )}
            </div>
        </div>
    );
}
