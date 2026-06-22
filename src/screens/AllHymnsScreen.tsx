import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Heart,
    Loader2,
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

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 pt-1 pb-3 border-b border-border flex-shrink-0">
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
                        {hymns.length} {tr("hymns listed serially", "orin ni títẹ̀lé")}
                    </p>
                </div>

                <BookOpen className="w-5 h-5 text-primary" />
            </div>

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
                ) : (
                    <div className="divide-y divide-border">
                        {hymns.map((hymn) => (
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