import { useEffect, useState } from "react";

export interface KeyboardState {
  /** True while a soft keyboard is covering part of the viewport */
  isOpen: boolean;
  /** Height (px) of the visible (visual) viewport */
  visualHeight: number;
}

/**
 * Tracks the mobile soft keyboard using `window.visualViewport` and focus
 * events. `visualHeight` lets callers compare against the real rendered app
 * height to know whether `dvh` already compensated for the keyboard or not.
 *
 * Detection covers both platforms:
 * - iOS keeps the layout viewport fixed, so `innerHeight - visualHeight > 0`.
 * - Android resizes the layout viewport, so `innerHeight` shrinks instead.
 */
export function useKeyboard(): KeyboardState {
  const [state, setState] = useState<KeyboardState>({
    isOpen: false,
    visualHeight:
      typeof window === "undefined" ? 0 : window.innerHeight,
  });

  useEffect(() => {
    const vv = window.visualViewport;
    const initialInnerHeight = window.innerHeight;

    const isEditable = (el: Element | null) =>
      !!el &&
      (el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el instanceof HTMLElement && el.isContentEditable));

    const update = () => {
      const visualHeight = vv ? vv.height : window.innerHeight;
      const covered = Math.max(0, window.innerHeight - visualHeight);
      const shrunk = initialInnerHeight - window.innerHeight;

      const open =
        isEditable(document.activeElement) && (covered > 60 || shrunk > 60);

      setState({
        isOpen: open,
        visualHeight,
      });
    };

    update();

    window.addEventListener("resize", update);
    vv?.addEventListener("resize", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);

    return () => {
      window.removeEventListener("resize", update);
      vv?.removeEventListener("resize", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);

  return state;
}
