import { Wifi, WifiOff } from "lucide-react";

export default function StatusBar({ isOnline }: { isOnline: boolean }) {
    return (
        <div className="flex items-center justify-between px-6 pt-3 pb-1 flex-shrink-0">
            <span className="text-xs font-semibold text-foreground">9:41</span>

            <div className="flex items-center gap-1 text-foreground">
                {isOnline ? (
                    <Wifi className="w-3.5 h-3.5" />
                ) : (
                    <WifiOff className="w-3.5 h-3.5 text-red-500" />
                )}

                <svg width="22" height="11" viewBox="0 0 22 11" fill="currentColor">
                    <rect
                        x="0"
                        y="1"
                        width="18"
                        height="9"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        fill="none"
                    />
                    <rect x="18.8" y="3.5" width="2.2" height="4" rx="1" opacity="0.5" />
                    <rect x="1.5" y="2.5" width="13" height="6" rx="1.2" />
                </svg>
            </div>
        </div>
    );
}