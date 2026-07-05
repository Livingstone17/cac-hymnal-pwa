import React from "react";

export default function Toggle({
    on,
    onToggle,
}: {
    on: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${on ? "bg-primary" : "bg-muted"
                }`}
        >
            <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${on ? "left-7" : "left-1"
                    }`}
            />
        </button>
    );
}