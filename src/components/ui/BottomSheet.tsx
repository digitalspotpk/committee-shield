"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  tall?: boolean;
};

/** Android-style modal bottom sheet, portalled into the phone frame. Drag down to dismiss. */
export function BottomSheet({ open, onClose, title, children, tall }: Props) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useEffect(() => setRoot(document.getElementById("frame-portal")), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  };

  if (!root) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="pointer-events-auto absolute inset-0 z-50 flex items-end">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`relative flex w-full flex-col rounded-t-[32px] border-t border-white/10 bg-ink-900/95 shadow-[0_-20px_60px_-10px_rgba(16,185,129,.25)] backdrop-blur-2xl ${tall ? "h-[92%]" : "max-h-[88%]"}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={onDragEnd}
          >
            <div className="flex cursor-grab justify-center pb-1 pt-3 active:cursor-grabbing">
              <span className="h-1.5 w-11 rounded-full bg-white/20" />
            </div>
            <div className="flex items-center justify-between px-5 pb-2 pt-1">
              <div className="text-lg font-semibold tracking-tight">{title}</div>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8" onPointerDownCapture={(e) => e.stopPropagation()}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    root,
  );
}
