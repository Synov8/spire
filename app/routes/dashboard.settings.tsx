export function meta() {
  return [{ title: "Settings | Spire" }, { name: "description", content: "Account and organisation settings" }];
}

import { useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { auth } from "~/lib/auth.server";
import { db } from "~/db";
import { user as userTable, organization as orgTable, member } from "~/db/schema";
import { eq, inArray } from "drizzle-orm";
import type { Route } from "./+types/dashboard.settings";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { user: null, subscription: null, orgCount: 0, integrationCount: 0, members: [], invitations: [] };

  const orgId = session.session.activeOrganizationId!;
  const membersList = await db.select().from(member).where(eq(member.organizationId, orgId));
  const currentOrg = await db.select().from(orgTable).where(eq(orgTable.id, orgId)).limit(1).then((r) => r[0]);
  const invitations = await auth.api.listInvitations({ query: { organizationId: orgId }, headers: request.headers });

  // Fetch user names/emails for all members
  const userIds = membersList.map((m) => m.userId);
  const users = userIds.length > 0 ? await db.select().from(userTable).where(inArray(userTable.id, userIds)) : [];
  const userMap = new Map(users.map((u) => [u.id, { name: u.name, email: u.email }]));

  return {
    user: session.user,
    orgCount: 1,
    integrationCount: 0,
    members: membersList.map((m) => ({ ...m, userName: userMap.get(m.userId)?.name || m.userId, userEmail: userMap.get(m.userId)?.email || "" })),
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
  const { user, orgCount, integrationCount, members, invitations } = loaderData;
  const fetcher = useFetcher();
  const [inviteEmail, setInviteEmail] = useState("");
  const inviteResult = fetcher.data as { ok?: boolean; error?: string } | null;

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Settings</h1>
        <p className="mt-1 text-sm text-[#6A6D6E]">Manage your profile, team, and organization</p>
      </div>

      <div className="space-y-8 overflow-hidden rounded-2xl border border-[#1A1D1E] bg-[#0B0D0E]">
        {/* Profile */}
        <section className="border-b border-[#1A1D1E] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8B8B93]">Profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#1A1D1E] bg-[#07080A] p-4"><label className="text-xs text-[#5C5C66] uppercase tracking-wider">Name</label><p className="mt-1 text-sm text-[#F1F1F3]">{user.name}</p></div>
            <div className="rounded-xl border border-[#1A1D1E] bg-[#07080A] p-4"><label className="text-xs text-[#5C5C66] uppercase tracking-wider">Email</label><p className="mt-1 text-sm text-[#F1F1F3]">{user.email}</p></div>
            <div className="rounded-xl border border-[#1A1D1E] bg-[#07080A] p-4"><label className="text-xs text-[#5C5C66] uppercase tracking-wider">Email verified</label><p className={`mt-1 flex items-center gap-1.5 text-sm ${user.emailVerified ? "text-[#00D4AA]" : "text-[#F59E0B]"}`}>{user.emailVerified ? (<><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" />Yes</>) : (<><span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />Pending</>)}</p></div>
            <div className="rounded-xl border border-[#1A1D1E] bg-[#07080A] p-4"><label className="text-xs text-[#5C5C66] uppercase tracking-wider">Member since</label><p className="mt-1 text-sm text-[#F1F1F3]">{new Date(user.createdAt).toLocaleDateString()}</p></div>
          </div>
        </section>

        {/* Team members */}
        <section className="border-b border-[#1A1D1E] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8B8B93]">Team members ({members.length})</h2>
          <div className="mt-4 space-y-3">
              {members.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl border border-[#1A1D1E] bg-[#07080A] px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1C1C24] to-[#141718] text-xs font-medium text-[#8B8B93] ring-1 ring-[#1A1D1E]">{m.userName[0]?.toUpperCase() ?? "?"}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-[#F1F1F3]">{m.userName}</p>
                      <p className="text-xs text-[#5C5C66]">{m.userEmail}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${m.role === "admin" || m.role === "owner" ? "bg-[#00D4AA]/10 text-[#00D4AA]" : "bg-[#1A1D1E] text-[#5C5C66]"}`}>{m.role}</span>
                  </div>
                ))}
            <fetcher.Form method="POST" className="mt-4 flex items-end gap-3">
              <input type="hidden" name="intent" value="invite-member" />
              <div className="flex-1">
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#8B8B93]">Invite by email</label>
                <input name="email" type="email" required placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1D1E] bg-[#07080A] px-3.5 py-2.5 text-sm text-[#F1F1F3] placeholder-[#5C5C66] focus:border-[#00D4AA] focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/20 transition-all" />
              </div>
              <select name="role" defaultValue="member"
                className="rounded-lg border border-[#1A1D1E] bg-[#07080A] px-3.5 py-2.5 text-sm text-[#F1F1F3] focus:border-[#00D4AA] focus:outline-none transition-all">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="rounded-lg bg-[#00D4AA] px-4 py-2.5 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 whitespace-nowrap shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">Invite</button>
            </fetcher.Form>
            {inviteResult?.error && <p className="text-sm text-[#EF4444]">{inviteResult.error}</p>}
          </div>
        </section>

        {/* Pending invitations */}
        {invitations.length > 0 && (
          <section className="border-b border-[#1A1D1E] p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#F59E0B]/15">
                <svg className="h-3 w-3 text-[#F59E0B]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5M8 11h.01"/></svg>
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">Pending invitations ({invitations.length})</h2>
            </div>
            <div className="mt-4 space-y-2">
              {invitations.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between rounded-xl border border-[#1A1D1E] bg-[#07080A] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F59E0B]/10 text-xs font-medium text-[#F59E0B]">{inv.email[0]?.toUpperCase() ?? "?"}</div>
                    <div>
                      <p className="text-sm text-[#F1F1F3]">{inv.email}</p>
                      <p className="text-xs text-[#5C5C66] capitalize">Role: {inv.role}</p>
                    </div>
                  </div>
                  <fetcher.Form method="POST">
                    <input type="hidden" name="intent" value="cancel-invitation" />
                    <input type="hidden" name="invitationId" value={inv.id} />
                    <button type="submit" className="rounded-lg px-3 py-1.5 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-all duration-200">Cancel</button>
                  </fetcher.Form>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Subscription */}
        <section className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8B8B93]">Billing</h2>
          <p className="mt-2 text-sm text-[#6A6D6E]">Manage your plan, invoices, and payment methods on the billing page.</p>
          <a href="/dashboard/billing" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">
            Go to billing
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 4l4 4-4 4"/></svg>
          </a>
        </section>

        {/* Organization */}
        <section className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8B8B93]">Organization</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#1A1D1E] bg-[#07080A] p-4"><label className="text-xs text-[#5C5C66] uppercase tracking-wider">Organizations</label><p className="mt-1 text-sm text-[#F1F1F3]">{orgCount}</p></div>
            <div className="rounded-xl border border-[#1A1D1E] bg-[#07080A] p-4"><label className="text-xs text-[#5C5C66] uppercase tracking-wider">Active integrations</label><p className="mt-1 text-sm text-[#F1F1F3]">{integrationCount}</p></div>
          </div>
        </section>
      </div>
    </div>
  );
}
