"use client";
/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion } from "framer-motion";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { cn, initials } from "@/lib/utils";

const MAX = 8 * 1024 * 1024;

async function uploadImage(file: File, kind: string): Promise<string> {
  const body = new FormData();
  body.append("image", file);
  body.append("kind", kind);
  const res = await fetch("/api/upload", { method: "POST", body });
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
  return json.url;
}

type Props = {
  value: string | null;
  onChange: (url: string) => void;
  kind: "profile" | "receipt";
  name?: string;
};

/** Uploads straight to ImgBB through /api/upload and hands back the secure URL. */
export function ImageUpload({ value, onChange, kind, name }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function handle(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > MAX) return toast.error("Image must be under 8 MB");
    const local = URL.createObjectURL(file);
    setPreview(local);
    setBusy(true);
    try {
      const url = await uploadImage(file, kind);
      onChange(url);
      toast.success(kind === "profile" ? "Photo uploaded" : "Receipt uploaded");
    } catch (e) {
      toast.error((e as Error).message);
      setPreview(null);
    } finally {
      setBusy(false);
      URL.revokeObjectURL(local);
    }
  }

  const shown = preview ?? value;
  const picker = (
    <input
      ref={input}
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif"
      className="hidden"
      onChange={(e) => handle(e.target.files?.[0])}
    />
  );

  if (kind === "profile") {
    return (
      <div className="flex flex-col items-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => input.current?.click()}
          className="group relative h-24 w-24 rounded-full p-[3px] [background:conic-gradient(from_180deg,#34d399,#f8c94a,#34d399)]"
        >
          <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-ink-900 text-2xl font-semibold">
            {shown ? <img src={shown} alt="" className="h-full w-full object-cover" /> : initials(name)}
          </span>
          <span className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-emerald-400 text-ink-950 shadow-glow-emerald">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </span>
        </motion.button>
        <span className="text-[11px] text-white/40">Tap to upload · hosted on ImgBB</span>
        {picker}
      </div>
    );
  }

  return (
    <div>
      <span className="mb-1.5 block px-1 text-xs font-medium text-white/55">Policy receipt</span>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={cn(
          "relative flex h-36 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.03] transition hover:border-emerald-400/50",
        )}
      >
        <AnimatePresence mode="wait">
          {shown ? (
            <motion.img key="img" src={shown} alt="Receipt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full object-cover" />
          ) : (
            <motion.span key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2 text-white/40">
              <ImagePlus className="h-7 w-7" />
              <span className="text-xs">Upload receipt image</span>
            </motion.span>
          )}
        </AnimatePresence>
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-300" />
          </span>
        )}
      </button>
      {value && (
        <a href={value} target="_blank" rel="noreferrer" className="mt-1 block px-1 text-[11px] text-emerald-300/80 underline">
          View full receipt
        </a>
      )}
      {picker}
    </div>
  );
}
