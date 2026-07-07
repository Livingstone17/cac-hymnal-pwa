// src/screens/SearchScreen.tsx

import React, { type CSSProperties } from "react";
import {
    Search,
    X,
    Hash,
    FileText,
    Grid3X3,
    Music,
    Loader2,
} from "lucide-react";

import type { HymnSummary, Language } from "../types/hymnal";
import ResultGroup from "../components/shared/ResultGroup";

// ── Props ─────────────────────────────────────────────────────────────────────

interface SearchScreenProps {
    // Data
    hymns: HymnSummary[];
    language: Language;
    offlineReady: boolean;

    // Search state (owned by parent, passed down)
    searchQuery: string;
    setSearchQuery: (q: string) => void;

    recentSearches: string[];
    setRecentSearches: React.Dispatch<React.SetStateAction<string[]>>;

    // Result buckets (computed in parent via useMemo)
    byNumber: HymnSummary[];
    byTitle: HymnSummary[];
    byCategory: HymnSummary[];
    lyricsResults: HymnSummary[];
    lyricsSearchLoading: boolean;

    // Actions
    onOpenHymn: (hymn: HymnSummary) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function tr(language: Language, en: string, yo: string): string {
    return language === "en" ? en : yo;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SearchScreen({
    hymns,
    language,
    offlineReady,
    searchQuery,
    setSearchQuery,
    recentSearches,
    setRecentSearches,
    byNumber,
    byTitle,
    byCategory,
    lyricsResults,
    lyricsSearchLoading,
    onOpenHymn,
}: SearchScreenProps) {
    const t = (en: string, yo: string) => tr(language, en, yo);

    const hasSearchQuery = Boolean(searchQuery.trim());

    // Show loading spinner or any result bucket being non-empty
    const hasAnySearchResults =
        byNumber.length > 0 ||
        byTitle.length > 0 ||
        byCategory.length > 0 ||
        lyricsResults.length > 0 ||
        lyricsSearchLoading;

    // Avoid showing the same hymn under both title/number/category AND lyrics
    const shownIds = new Set<number>([
        ...byNumber.map((h) => h.id),
        ...byTitle.map((h) => h.id),
        ...byCategory.map((h) => h.id),
    ]);

    const filteredLyricsResults = lyricsResults.filter(
        (h) => !shownIds.has(h.id)
    );

    // Save to recent searches on Enter
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            setRecentSearches((prev) =>
                [
                    searchQuery.trim(),
                    ...prev.filter((s) => s !== searchQuery.trim()),
                ].slice(0, 6)
            );
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* ── Header + Search Input ── */}
            <div className="px-4 pt-5 pb-3 flex-shrink-0">
                <h2 className="text-lg font-bold text-foreground mb-3">
                    {t("Search Hymns", "Ìwádìí Orin")}
                </h2>

                {/* Input */}
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t(
                            "Search by number, title, category, or lyrics…",
                            "Ìwádìí nípasẹ̀ nọ́mbà, àkọlé, ẹ̀ka, tàbí orin…"
                        )}
                        className="w-full pl-10 pr-9 py-3 bg-muted rounded-xl text-sm
                       text-foreground placeholder:text-muted-foreground
                       outline-none focus:ring-2"
                        style={
                            { "--tw-ring-color": "rgba(26,35,126,0.25)" } as CSSProperties
                        }
                    />

                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    )}
                </div>

                {/* Exact-match mode indicator */}
                {hasSearchQuery && searchQuery.trim().length >= 2 && (
                    <div className="mt-2 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[11px] text-muted-foreground">
                            {t(
                                "Searching lyrics with exact matching",
                                "Wíwá orin pẹ̀lú ìbámu gangan"
                            )}
                        </span>
                    </div>
                )}

                {/* Recent searches */}
                {!searchQuery && recentSearches.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {recentSearches.map((s) => (
                            <button
                                key={s}
                                onClick={() => setSearchQuery(s)}
                                className="bg-muted text-muted-foreground text-xs px-3 py-1.5
                           rounded-full border border-border
                           hover:text-foreground transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Offline tip */}
                {!offlineReady && (
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                        {t(
                            "Tip: download hymns in Settings to enable offline lyrics search.",
                            "Àbá: ṣe igbasilẹ orin ninu Ètò lati jẹ́ kí ìwádìí orin ṣiṣẹ́ láìní ìnítánẹ́ẹ̀tì."
                        )}
                    </p>
                )}
            </div>

            {/* ── Results Area ── */}
            <div
                className="flex-1 overflow-y-auto px-4 pb-4"
                style={{ scrollbarWidth: "none" }}
            >
                {/* Empty state: no query yet */}
                {!hasSearchQuery && (
                    <div className="pt-10 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                            <Search className="w-7 h-7 text-muted-foreground" />
                        </div>

                        <p className="text-muted-foreground text-sm">
                            {t(
                                `Search ${hymns.length || ""} CAC hymns`,
                                `Ìwádìí orin CAC ${hymns.length || ""}`
                            )}
                        </p>
                    </div>
                )}

                {/* Empty state: query entered but nothing found yet */}
                {hasSearchQuery && !hasAnySearchResults && (
                    <div className="pt-14 text-center px-6">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                            <FileText className="w-7 h-7 text-muted-foreground" />
                        </div>

                        <p className="font-bold text-foreground mb-1">
                            {t("No hymns found", "Kò sí orin")}
                        </p>

                        <p className="text-muted-foreground text-sm">
                            {t(
                                "Try searching in English or Yoruba.",
                                "Gbiyanju ìwádìí ní Gẹ̀ẹ́sì tàbí Yorùbá."
                            )}
                        </p>
                    </div>
                )}

                {/* Results */}
                {hasSearchQuery && hasAnySearchResults && (
                    <div className="space-y-5 pt-2">
                        {byNumber.length > 0 && (
                            <ResultGroup
                                title={t("By Number", "Nípasẹ̀ Nọ́mbà")}
                                icon={Hash}
                                hymns={byNumber}
                                query={searchQuery}
                                language={language}
                                onOpen={onOpenHymn}
                            />
                        )}

                        {byTitle.length > 0 && (
                            <ResultGroup
                                title={t("By Title", "Nípasẹ̀ Àkọlé")}
                                icon={FileText}
                                hymns={byTitle}
                                query={searchQuery}
                                language={language}
                                onOpen={onOpenHymn}
                            />
                        )}

                        {byCategory.length > 0 && (
                            <ResultGroup
                                title={t("By Category", "Nípasẹ̀ Ẹ̀ka")}
                                icon={Grid3X3}
                                hymns={byCategory}
                                query={searchQuery}
                                language={language}
                                onOpen={onOpenHymn}
                            />
                        )}

                        {/* Lyrics loading spinner */}
                        {lyricsSearchLoading && (
                            <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs py-4">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t(
                                    "Searching cached lyrics…",
                                    "Ń wá nínú orin tí a pamọ́…"
                                )}
                            </div>
                        )}

                        {/* Lyrics results (deduplicated) */}
                        {filteredLyricsResults.length > 0 && (
                            <ResultGroup
                                title={t("By Lyrics", "Nípasẹ̀ Orin")}
                                icon={Music}
                                hymns={filteredLyricsResults}
                                query={searchQuery}
                                language={language}
                                onOpen={onOpenHymn}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}