import { MembersList } from "@/components/members/MembersList";
import { MAX_MEMBERS } from "@/lib/config";
import { getCycleState } from "@/lib/draw";
import { listMembers } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Members" };

export default async function MembersPage() {
  const user = await requireUser();
  const [members, state] = await Promise.all([listMembers(false), getCycleState()]);
  const wins = new Map(state.draws.map((d) => [d.winner.id, d.month]));
  return (
    <MembersList
      members={members.map((m) => ({
        ...m,
        email: user.role === "admin" || m.id === user.id ? m.email : "",
        wonMonth: wins.get(m.id) ?? null,
      }))}
      viewerId={user.id}
      viewerIsAdmin={user.role === "admin"}
      maxMembers={MAX_MEMBERS}
    />
  );
}
