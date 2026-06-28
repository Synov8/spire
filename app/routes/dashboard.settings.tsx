import { useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { auth } from "~/lib/auth.server";
import { db } from "~/db";
import { subscription, organization as orgTable, member } from "~/db/schema";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/dashboard.settings";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { user: null, subscription: null, orgCount: 0, integrationCount: 0, members: [], invitations: [] };

  const orgId = session.session.activeOrganizationId!;
  const membersList = await db.select().from(member).where(eq(member.organizationId, orgId));
  const currentOrg = await db.select().from(orgTable).where(eq(orgTable.id, orgId)).limit(1).then((r) => r[0]);
  const invitations = await auth.api.listInvitations({ query: { organizationId: orgId }, headers: request.headers });

  return {
    user: session.user,
    subscription: await db.select().from(subscription).where(eq(subscription.referenceId, session.user.id)).then((r) => r[0] || null),
    orgCount: 1,
    integrationCount: 0,
    members: membersList,
    orgName: currentOrg?.name,
    invitations: Array.isArray(invitations) ? invitations : [],
  };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { ok: false };

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  const orgId = session.session.activeOrganizationId!;

  if (intent === "invite-member") {
    const email = formData.get("email") as string;
    const role = formData.get("role") as string || "member";
    if (!email) return { ok: false, error: "Email required" };

    try {
      await auth.api.createInvitation({
        body: { email, role: role as "member" | "admin", organizationId: orgId },
        headers: request.headers,
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to invite" };
    }
  }

  if (intent === "cancel-invitation") {
    const invitationId = formData.get("invitationId") as string;
    try { await auth.api.cancelInvitation({ body: { invitationId }, headers: request.headers }); return { ok: true }; }
    catch (err) { return { ok: false, error: err instanceof Error ? err.message : "Failed to cancel" }; }
  }

  return { ok: false };
}

export default function Settings({ loaderData }: Route.ComponentProps) {
  const { user, subscription: sub, orgCount, integrationCount, members, invitations } = loaderData;
  const fetcher = useFetcher();
  const [inviteEmail, setInviteEmail] = useState("");
  const inviteResult = fetcher.data as { ok?: boolean; error?: string } | null;

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Settings</h1>

      <div className="space-y-8 rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8B8B93]">Profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><label className="text-xs text-[#5C5C66]">Name</label><p className="mt-0.5 text-[#F1F1F3]">{user.name}</p></div>
            <div><label className="text-xs text-[#5C5C66]">Email</label><p className="mt-0.5 text-[#F1F1F3]">{user.email}</p></div>
            <div><label className="text-xs text-[#5C5C66]">Email verified</label><p className={`mt-0.5 ${user.emailVerified ? "text-[#00D4AA]" : "text-[#F59E0B]"}`}>{user.emailVerified ? "Yes" : "Pending"}</p></div>
            <div><label className="text-xs text-[#5C5C66]">Member since</label><p className="mt-0.5 text-[#F1F1F3]">{new Date(user.createdAt).toLocaleDateString()}</p></div>
          </div>
        </section>

        <section className="border-t border-[#1C1C24] pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8B8B93]">Team members ({members.length})</h2>
          <div className="mt-4 space-y-3">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-[#1C1C24] bg-[#0A0A0C] px-4 py-2.5">
                <div>
                  <p className="text-sm text-[#F1F1F3]">{m.userId}</p>
                  <p className="text-xs text-[#5C5C66] capitalize">{m.role}</p>
                </div>
              </div>
            ))}
            <fetcher.Form method="POST" className="mt-4 flex items-end gap-3">
              <input type="hidden" name="intent" value="invite-member" />
              <div className="flex-1">
                <label className="mb-1 block text-xs uppercase tracking-wider text-[#8B8B93]">Invite by email</label>
                <input name="email" type="email" required placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#1C1C24] bg-[#0A0A0C] px-3 py-2 text-sm text-[#F1F1F3] placeholder-[#5C5C66] focus:border-[#00D4AA] focus:outline-none transition-colors" />
              </div>
              <select name="role" defaultValue="member"
                className="rounded-lg border border-[#1C1C24] bg-[#0A0A0C] px-3 py-2 text-sm text-[#F1F1F3] focus:border-[#00D4AA] focus:outline-none">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-colors whitespace-nowrap">Invite</button>
            </fetcher.Form>
            {inviteResult?.error && <p className="text-sm text-[#EF4444]">{inviteResult.error}</p>}
          </div>
        </section>

        {invitations.length > 0 && (
          <section className="border-t border-[#1C1C24] pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">Pending invitations ({invitations.length})</h2>
            <div className="mt-4 space-y-2">
              {invitations.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border border-[#1C1C24] bg-[#0A0A0C] px-4 py-2.5">
                  <div>
                    <p className="text-sm text-[#F1F1F3]">{inv.email}</p>
                    <p className="text-xs text-[#5C5C66] capitalize">Role: {inv.role}</p>
                  </div>
                  <fetcher.Form method="POST">
                    <input type="hidden" name="intent" value="cancel-invitation" />
                    <input type="hidden" name="invitationId" value={inv.id} />
                    <button type="submit" className="text-sm text-[#EF4444] hover:text-[#EF4444]/80">Cancel</button>
                  </fetcher.Form>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="border-t border-[#1C1C24] pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8B8B93]">Subscription</h2>
          {sub ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="rounded bg-[#00D4AA]/10 px-2 py-0.5 text-sm font-medium text-[#00D4AA] capitalize">{sub.plan}</span>
                <span className="rounded bg-[#1C1C24] px-2 py-0.5 text-xs text-[#5C5C66]">{sub.status}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div><label className="text-xs text-[#5C5C66]">Billing interval</label><p className="text-sm text-[#F1F1F3] capitalize">{sub.billingInterval || "—"}</p></div>
                <div><label className="text-xs text-[#5C5C66]">Period end</label><p className="text-sm text-[#F1F1F3]">{sub.periodEnd ? new Date(sub.periodEnd).toLocaleDateString() : "—"}</p></div>
                <div><label className="text-xs text-[#5C5C66]">Seats</label><p className="text-sm text-[#F1F1F3]">{sub.seats || "1"}</p></div>
              </div>
              {sub.cancelAtPeriodEnd && <p className="text-sm text-[#F59E0B]">Subscription cancels at period end</p>}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-[#1C1C24] bg-[#0A0A0C]/50 p-5">
              <p className="text-sm text-[#5C5C66]">You are on the free plan.</p>
              <a href="/pricing" className="mt-3 inline-block rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-colors">View plans</a>
            </div>
          )}
        </section>

        <section className="border-t border-[#1C1C24] pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8B8B93]">Organization</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><label className="text-xs text-[#5C5C66]">Organizations</label><p className="text-[#F1F1F3]">{orgCount}</p></div>
            <div><label className="text-xs text-[#5C5C66]">Active integrations</label><p className="text-[#F1F1F3]">{integrationCount}</p></div>
          </div>
        </section>
      </div>
    </div>
  );
}
