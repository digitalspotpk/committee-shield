"use client";

import { useState, useTransition } from "react";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";

type Props = {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  children: React.ReactNode;
  variant?: "danger" | "primary" | "gold";
  triggerVariant?: "danger" | "ghost" | "subtle" | "primary" | "gold";
  size?: "sm" | "md";
  className?: string;
};

export function ConfirmButton({
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  children,
  variant = "danger",
  triggerVariant = "danger",
  size = "sm",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <Button type="button" size={size} variant={triggerVariant} className={className} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={title}>
        <div className="space-y-5 pt-1">
          <div className="text-sm leading-relaxed text-white/65">{message}</div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={variant}
              loading={pending}
              onClick={() =>
                start(async () => {
                  await onConfirm();
                  setOpen(false);
                })
              }
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
