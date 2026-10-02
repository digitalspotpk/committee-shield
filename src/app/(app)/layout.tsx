import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { getNotifications } from "@/lib/queries";
import { isProfileComplete, requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!isProfileComplete(user) && user.role !== "admin") redirect("/onboarding");
  const notifications = await getNotifications(user);

  return (
    <AppShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        premiumBudget: user.premiumBudget,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        verified: user.verified,
      }}
      notifications={notifications}
    >
      {children}
    </AppShell>
  );
}
