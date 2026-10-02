import { PolicyTracker } from "@/components/insurance/PolicyTracker";
import { CYCLE_LENGTH } from "@/lib/config";
import { getCycleState } from "@/lib/draw";
import { listPlans } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Insurance Tracker" };

export default async function InsurancePage() {
  const user = await requireUser();
  const state = await getCycleState();
  const plans = await listPlans(state.cycle);
  // Hide receipt URLs from members who don't own the policy.
  const visible = plans.map((p) =>
    user.role === "admin" || p.userId === user.id ? p : { ...p, receiptUrl: null, policyNumber: null },
  );
  return (
    <PolicyTracker
      cycle={state.cycle}
      plans={visible}
      drawsDone={state.draws.length}
      viewerId={user.id}
      isAdmin={user.role === "admin"}
      cycleLength={CYCLE_LENGTH}
    />
  );
}
