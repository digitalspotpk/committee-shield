import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { MAX_MEMBERS } from "@/lib/config";
import { getCycleState } from "@/lib/draw";
import { listMembers, listPlans } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  const state = await getCycleState();
  const [members, plans] = await Promise.all([listMembers(true), listPlans(state.cycle)]);
  return (
    <AdminPanel
      me={user.id}
      members={members}
      plans={plans}
      draws={state.draws.map((d) => ({ id: d.id, month: d.month, winner: { id: d.winner.id, name: d.winner.name } }))}
      cycle={state.cycle}
      nextMonth={state.nextMonth}
      isComplete={state.isComplete}
      eligibleCount={state.eligible.length}
      maxMembers={MAX_MEMBERS}
    />
  );
}
