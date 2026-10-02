"use client";

import { useState } from "react";
import type { Notification } from "@/lib/queries";
import { AppBar } from "./AppBar";
import { BottomNav } from "./BottomNav";
import { ProfileDrawer } from "./ProfileDrawer";
import { ShellContext, type ShellUser } from "./ShellContext";

export function AppShell({
  user,
  notifications,
  children,
}: {
  user: ShellUser;
  notifications: Notification[];
  children: React.ReactNode;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <ShellContext.Provider value={{ user, openProfile: () => setProfileOpen(true) }}>
      <AppBar user={user} notifications={notifications} onAvatar={() => setProfileOpen(true)} />
      <main id="app-scroll" className="no-scrollbar relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-32 pt-2">
        {children}
      </main>
      <BottomNav isAdmin={user.role === "admin"} />
      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} user={user} />
    </ShellContext.Provider>
  );
}
