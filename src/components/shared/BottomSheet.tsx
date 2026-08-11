import React, {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { AnimatePresence, motion } from "motion/react";

import { haptic } from "../../lib/haptics";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Pinned above the scrollable content (e.g. title row, search input) */
  header?: ReactNode;
  /** Pinned below the scrollable content (e.g. action buttons) */
  footer?: ReactNode;
  /** Scrollable content */
  children: ReactNode;
  /** aria-label for the backdrop */
  closeLabel?: string;
}

/**
 * Shared iOS-style bottom sheet. Drag-to-dismiss is only enabled while the
 * content is scrolled to the top, so scrolling inside never fights the drag
 * gesture. Fires a subtle haptic on open and close.
 */
export default function BottomSheet({
  open,
  onClose,
  header,
  footer,
  children,
  closeLabel = "Close",
}: BottomSheetProps) {
  const [canDrag, setCanDrag] = useState(true);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Haptic on open/close transitions (skips the initial render).
  const prevOpen = useRef(open);
  useEffect(() => {
    if (open === prevOpen.current) return;
    prevOpen.current = open;
    haptic(open ? 12 : 8);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.45)" }}
          role="button"
          aria-label={closeLabel}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            drag={canDrag ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 z-50 rounded-t-[28px] bg-card shadow-2xl max-h-[85%] flex flex-col overflow-hidden"
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
            }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30 mx-auto mt-3 mb-1 flex-shrink-0" />

            {header && <div className="flex-shrink-0">{header}</div>}

            {/* Scrollable content */}
            <div
              ref={contentRef}
              onScroll={() => {
                const el = contentRef.current;
                setCanDrag(!el || el.scrollTop <= 0);
              }}
              className="flex-1 min-h-0 overflow-y-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {children}
            </div>

            {footer && <div className="flex-shrink-0">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
