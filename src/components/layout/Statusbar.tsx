/**
 * Static top spacer that keeps the app content clear of the device notch /
 * status bar area (standalone PWA). Deliberately has no clock, wifi, or
 * battery indicators — the real OS chrome shows those.
 */
export default function StatusBar() {
    return (
        <div
            className="flex-shrink-0"
            style={{
                paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
            }}
        />
    );
}
