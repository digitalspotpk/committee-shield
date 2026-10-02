import { DrawClient } from "@/components/draw/DrawClient";
import { getCycleState } from "@/lib/draw";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Committee Draw" };

export default async function DrawPage() {
  const user = await requireUser();
  const state = await getCycleState();
  // Re-key on progress so the wheel rebuilds with the new eligible list after each draw.
  const key = `${state.nextCycle}-${state.nextMonth}-${state.eligible.length}`;
  return (
    <>
      <div className="mb-3 px-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Lucky <span className="text-gradient-gold">Draw</span>
        </h1>
        <p className="text-sm text-white/45">Previous winners of this cycle are automatically excluded.</p>
      </div>
      <DrawClient
        key={key}
        isAdmin={user.role === "admin"}
        cycle={state.cycle}
        nextCycle={state.nextCycle}
        nextMonth={state.nextMonth}
        isComplete={state.isComplete}
        eligible={state.eligible}
        poolAmount={state.poolAmount}
        history={state.draws}
      />
    </>
  );
}
