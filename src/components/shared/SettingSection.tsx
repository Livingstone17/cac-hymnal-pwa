import React from "react";
import type { ElementType, ReactNode } from "react";

export default function SettingsSection({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: ElementType;
    children: ReactNode;
}) {
    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {title}
                </span>
            </div>

            <div className="px-4 py-3">{children}</div>
        </div>
    );
}