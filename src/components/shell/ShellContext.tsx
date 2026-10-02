"use client";

import { createContext, useContext } from "react";

export type ShellUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  age: number | null;
  premiumBudget: number | null;
  profileImageUrl: string | null;
  role: "member" | "admin";
  verified: boolean;
};

type Ctx = { user: ShellUser; openProfile: () => void };

export const ShellContext = createContext<Ctx | null>(null);

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside <AppShell>");
  return ctx;
}
