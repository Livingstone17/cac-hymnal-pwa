// import React from "react";

// import { ChevronRight } from "lucide-react";
// import type { ElementType } from "react";

// import { displayHymnNumber } from "../../lib/hymnUtils";
// import type { Hymn, HymnSummary, Language } from "../../types/hymnal";

// export default function ResultGroup({
//     title,
//     icon: Icon,
//     hymns,
//     query,
//     language,
//     onOpen,
// }: {
//     title: string;
//     icon: ElementType;
//     hymns: HymnSummary[];
//     query: string;
//     language: Language;
//     onOpen: (h: HymnSummary) => void;
// }) {
//     return (
//         <div>
//             <div className="flex items-center gap-2 mb-2">
//                 <Icon className="w-3 h-3 text-muted-foreground" />
//                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
//                     {title}
//                 </span>
//             </div>

//             <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
//                 {hymns.slice(0, 8).map((hymn) => {
//                     const matchLine =
//                         "verses" in hymn
//                             ? (hymn as Hymn).verses
//                                 .flatMap((v) => [...v.en, ...v.yo])
//                                 .find((l) =>
//                                     l.toLowerCase().includes(query.toLowerCase())
//                                 )
//                             : null;

//                     return (
//                         <button
//                             key={hymn.id}
//                             onClick={() => onOpen(hymn)}
//                             className="w-full p-3 hover:bg-muted/50 transition-colors text-left"
//                         >
//                             <div className="flex items-center gap-3">
//                                 <span className="text-[#D4A017] font-black text-sm w-10 flex-shrink-0">
//                                     {displayHymnNumber(hymn)}
//                                 </span>

//                                 <div className="flex-1 min-w-0">
//                                     <div className="flex items-baseline gap-1.5 flex-wrap">
//                                         <span className="text-foreground text-sm font-semibold">
//                                             {language === "en" ? hymn.titleEn : hymn.titleYo}
//                                         </span>

//                                         <span className="text-muted-foreground text-xs">
//                                             · {language === "en" ? hymn.titleYo : hymn.titleEn}
//                                         </span>
//                                     </div>

//                                     <p className="text-muted-foreground text-xs mt-0.5 truncate">
//                                         {matchLine ??
//                                             `${hymn.hymnType === "various" ? "Various · " : ""}${language === "en" ? hymn.categoryEn : hymn.categoryYo
//                                             }`}
//                                     </p>
//                                 </div>

//                                 <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
//                             </div>
//                         </button>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// }

import React from "react";

import { ChevronRight } from "lucide-react";
import type { ElementType } from "react";

import { displayHymnNumber } from "../../lib/hymnUtils";
import type { Hymn, HymnSummary, Language } from "../../types/hymnal";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Strip Unicode combining marks (diacritics) from a string so that
 * e.g. "igbala" can match "ìgbàlà".
 */
function stripDiacritics(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .normalize("NFC");
}

function normalizeForSearch(text: string, stripped: boolean): string {
    const base = text.toLowerCase().replace(/\s+/g, " ").trim();
    return stripped ? stripDiacritics(base) : base;
}

/**
 * Try to find `query` inside `line`.
 *
 * Priority:
 *  1. Exact match preserving diacritics  → returns { found, stripped: false }
 *  2. Diacritic-stripped fallback         → returns { found, stripped: true }
 */
function matchesLine(
    line: string,
    query: string
): { found: boolean; stripped: boolean } {
    if (normalizeForSearch(line, false).includes(normalizeForSearch(query, false))) {
        return { found: true, stripped: false };
    }
    if (normalizeForSearch(line, true).includes(normalizeForSearch(query, true))) {
        return { found: true, stripped: true };
    }
    return { found: false, stripped: false };
}

/**
 * Highlight every occurrence of `query` inside `text`.
 *
 * When `useStripped` is true the comparison ignores diacritics, but the
 * *original* characters are always rendered (we never mutate the display text).
 */
function highlightText(
    text: string,
    query: string,
    useStripped: boolean
): React.ReactNode {
    const normalizedQuery = normalizeForSearch(query, useStripped);
    if (!normalizedQuery) return text;

    // Work on a comparable version of the text, but split the *original*
    const comparableText = normalizeForSearch(text, useStripped);

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Walk through every occurrence
    let searchFrom = 0;
    while (searchFrom < comparableText.length) {
        const idx = comparableText.indexOf(normalizedQuery, searchFrom);
        if (idx === -1) break;

        // Text before the match
        if (idx > lastIndex) {
            parts.push(text.slice(lastIndex, idx));
        }

        // The matched segment (from the *original* text so diacritics are kept)
        parts.push(
            <mark
                key={idx}
                className="
          bg-yellow-200/80 dark:bg-yellow-700/50
          text-foreground
          rounded-[3px]
          px-[1px]
          not-italic
        "
            >
                {text.slice(idx, idx + normalizedQuery.length)}
            </mark>
        );

        lastIndex = idx + normalizedQuery.length;
        searchFrom = lastIndex;
    }

    // Remainder after the last match
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : text;
}

/**
 * Find the best matching line AND up to one line of context from
 * the surrounding verse lines.
 *
 * Returns null when there is no lyrics match (e.g. number / title results).
 */
function findMatchContext(
    hymn: HymnSummary,
    query: string
): { line: string; context: string; stripped: boolean } | null {
    if (!("verses" in hymn)) return null;

    const fullHymn = hymn as Hymn;
    // Flatten to { text, verseIndex, lineIndex } so we can grab neighbours
    const allLines: { text: string; vi: number; li: number; lang: "en" | "yo" }[] =
        [];

    fullHymn.verses.forEach((verse, vi) => {
        verse.en.forEach((line, li) => allLines.push({ text: line, vi, li, lang: "en" }));
        verse.yo.forEach((line, li) => allLines.push({ text: line, vi, li, lang: "yo" }));
    });

    // 1st pass: exact diacritic match
    for (let i = 0; i < allLines.length; i++) {
        const { text } = allLines[i];
        const { found, stripped } = matchesLine(text, query);
        if (!found) continue;

        // Grab the next non-empty line in the same language as context
        const nextSameLang = allLines
            .slice(i + 1)
            .find((l) => l.lang === allLines[i].lang && l.text.trim());

        const context = [text.trim(), nextSameLang?.text.trim()]
            .filter(Boolean)
            .join(" / ");

        return { line: text.trim(), context, stripped };
    }

    return null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ResultGroup({
    title,
    icon: Icon,
    hymns,
    query,
    language,
    onOpen,
}: {
    title: string;
    icon: ElementType;
    hymns: HymnSummary[];
    query: string;
    language: Language;
    onOpen: (h: HymnSummary) => void;
}) {
    return (
        <div>
            {/* Group header */}
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {title}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                    ({Math.min(hymns.length, 8)}{hymns.length > 8 ? "+" : ""})
                </span>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {hymns.slice(0, 8).map((hymn) => {
                    // ── Lyrics match detection ─────────────────────────────────────
                    const matchCtx = findMatchContext(hymn, query);

                    // Title in primary / secondary language
                    const primaryTitle = language === "en" ? hymn.titleEn : hymn.titleYo;
                    const secondaryTitle = language === "en" ? hymn.titleYo : hymn.titleEn;

                    // Sub-line: matched lyrics line OR category fallback
                    const categoryFallback = `${hymn.hymnType === "various" ? "Various · " : ""
                        }${language === "en" ? hymn.categoryEn : hymn.categoryYo}`;

                    return (
                        <button
                            key={hymn.id}
                            onClick={() => onOpen(hymn)}
                            className="w-full p-3 hover:bg-muted/50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                {/* Hymn number */}
                                <span className="text-[#D4A017] font-black text-sm w-10 flex-shrink-0">
                                    {displayHymnNumber(hymn)}
                                </span>

                                {/* Title + sub-line */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-1.5 flex-wrap">
                                        {/* Primary title with highlight */}
                                        <span className="text-foreground text-sm font-semibold">
                                            {highlightText(primaryTitle ?? "", query, false)}
                                        </span>

                                        {/* Secondary title — smaller, muted */}
                                        {secondaryTitle && (
                                            <span className="text-muted-foreground text-xs truncate">
                                                · {highlightText(secondaryTitle, query, false)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Lyrics context OR category */}
                                    {matchCtx ? (
                                        <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed line-clamp-2">
                                            {/* Italic quote marks to signal it's a lyrics excerpt */}
                                            <span className="italic">
                                                "
                                                {highlightText(
                                                    matchCtx.context || matchCtx.line,
                                                    query,
                                                    matchCtx.stripped   // use the same mode we detected with
                                                )}
                                                "
                                            </span>

                                            {/* Badge when match was found via diacritic stripping */}
                                            {matchCtx.stripped && (
                                                <span
                                                    className="
                            ml-1.5 not-italic
                            text-[9px] font-medium
                            bg-muted text-muted-foreground
                            rounded px-1 py-px
                            align-middle
                          "
                                                >
                                                    ~match
                                                </span>
                                            )}
                                        </p>
                                    ) : (
                                        <p className="text-muted-foreground text-xs mt-0.5 truncate">
                                            {categoryFallback}
                                        </p>
                                    )}
                                </div>

                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}