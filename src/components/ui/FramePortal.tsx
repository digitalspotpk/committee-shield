"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Renders children into the phone frame overlay layer (above the bottom nav). */
export function FramePortal({ children }: { children: React.ReactNode }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useEffect(() => setRoot(document.getElementById("frame-portal")), []);
  return root ? createPortal(children, root) : null;
}
