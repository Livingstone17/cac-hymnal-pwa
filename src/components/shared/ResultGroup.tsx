import { ChevronRight } from "lucide-react";
import type { ElementType } from "react";

import { displayHymnNumber } from "../../lib/hymnUtils";
import type { Hymn, HymnSummary, Language } from "../../types/hymnal";

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
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {title}
                </span>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {hymns.slice(0, 8).map((hymn) => {
                    const matchLine =
                        "verses" in hymn
                            ? (hymn as Hymn).verses
                                .flatMap((v) => [...v.en, ...v.yo])
                                .find((l) =>
                                    l.toLowerCase().includes(query.toLowerCase())
                                )
                            : null;

                    return (
                        <button
                            key={hymn.id}
                            onClick={() => onOpen(hymn)}
                            className="w-full p-3 hover:bg-muted/50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-[#D4A017] font-black text-sm w-10 flex-shrink-0">
                                    {displayHymnNumber(hymn)}
                                </span>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-1.5 flex-wrap">
                                        <span className="text-foreground text-sm font-semibold">
                                            {language === "en" ? hymn.titleEn : hymn.titleYo}
                                        </span>

                                        <span className="text-muted-foreground text-xs">
                                            · {language === "en" ? hymn.titleYo : hymn.titleEn}
                                        </span>
                                    </div>

                                    <p className="text-muted-foreground text-xs mt-0.5 truncate">
                                        {matchLine ??
                                            `${hymn.hymnType === "various" ? "Various · " : ""}${language === "en" ? hymn.categoryEn : hymn.categoryYo
                                            }`}
                                    </p>
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