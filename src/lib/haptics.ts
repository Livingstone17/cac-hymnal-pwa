/**
 * Lightweight haptic feedback wrapper around the Vibration API.
 * No-ops on desktop and unsupported browsers.
 */
export function haptic(pattern: number | number[] = 10): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;

  navigator.vibrate(pattern);
}
