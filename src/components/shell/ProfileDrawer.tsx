"use client";

import { LogOut, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { signOutAction } from "@/app/actions/auth";
import { updateMyProfileAction } from "@/app/actions/profile";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { Badge } from "@/components/ui/Badge";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import type { ShellUser } from "./ShellContext";

export function ProfileDrawer({ open, onClose, user }: { open: boolean; onClose: () => void; user: ShellUser }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <BottomSheet open={open} onClose={onClose} title="My profile" tall>
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
        <Badge tone={user.role === "admin" ? "gold" : "emerald"} dot>
          {user.role === "admin" ? "Super Admin" : "Member"}
        </Badge>
        <Badge tone={user.verified ? "emerald" : "neutral"}>
          <ShieldCheck className="h-3 w-3" /> {user.verified ? "Verified" : "Pending verification"}
        </Badge>
      </div>
      <div className="glass mb-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-white/60">
        <Mail className="h-4 w-4 text-emerald-300" />
        <span className="truncate">{user.email}</span>
      </div>
      <ProfileForm
        initial={user}
        submit={updateMyProfileAction}
        onDone={() => {
          router.refresh();
          onClose();
        }}
      />
      <Button variant="danger" className="mt-3 w-full" loading={pending} onClick={() => start(() => signOutAction())}>
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </BottomSheet>
  );
}
