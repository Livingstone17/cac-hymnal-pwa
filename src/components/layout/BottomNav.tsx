import React from "react";

import type { ElementType } from "react";

import {
    Grid3X3,
    Heart,
    Home,
    Search,
    Settings,
} from "lucide-react";

import type { Language, Tab } from "../../types/hymnal";

export default function BottomNav({
    activeTab,
    language,
    favoritesCount,
    onNavigate,
}: {
    activeTab: Tab;
    language: Language;
    favoritesCount: number;
    onNavigate: (tab: Tab) => void;
}) {
    const tabs: { id: Tab; Icon: ElementType; en: string; yo: string }[] = [
        { id: "home", Icon: Home, en: "Home", yo: "Ilé" },
        { id: "search", Icon: Search, en: "Search", yo: "Ìwádìí" },
        { id: "categories", Icon: Grid3X3, en: "Categories", yo: "Ẹ̀ka" },
        { id: "favorites", Icon: Heart, en: "Favorites", yo: "Àyọ̀ Mi" },
        { id: "settings", Icon: Settings, en: "Settings", yo: "Ìtòlẹ́sẹẹ̀" },
    ];

    return (
        <div className="flex items-center justify-around px-1 py-2 border-t border-border bg-card flex-shrink-0">
            {tabs.map(({ id, Icon, en, yo }) => {
                const active = activeTab === id;

                return (
                    <button
                        key={id}
                        onClick={() => onNavigate(id)}
                        className="flex flex-col items-center gap-0.5 px-2 py-1"
                    >
                        <div className="relative">
                            <Icon
                                className={`w-[22px] h-[22px] transition-colors ${active ? "text-primary" : "text-muted-foreground"
                                    }`}
                            />

                            {id === "favorites" && favoritesCount > 0 && (
                                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-[#D4A017] rounded-full text-[8px] flex items-center justify-center text-white font-bold leading-none">
                                    {favoritesCount}
                                </span>
                            )}
                        </div>

                        <span
                            className={`text-[9px] font-semibold leading-none transition-colors ${active ? "text-primary" : "text-muted-foreground"
                                }`}
                        >
                            {language === "en" ? en : yo}
                        </span>

                        {active && (
                            <div className="w-1 h-1 rounded-full bg-[#D4A017] mt-0.5" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}