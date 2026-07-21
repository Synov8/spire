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
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-tertiary">Manage your profile, team, and organization</p>
      </div>

      <div className="space-y-8 overflow-hidden rounded-2xl border border-border-primary bg-surface-secondary">
        {/* Profile */}
        <section className="border-b border-border-primary p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border-primary bg-surface-primary p-4"><label className="text-xs text-text-tertiary uppercase tracking-wider">Name</label><p className="mt-1 text-sm text-text-primary">{user.name}</p></div>
            <div className="rounded-xl border border-border-primary bg-surface-primary p-4"><label className="text-xs text-text-tertiary uppercase tracking-wider">Email</label><p className="mt-1 text-sm text-text-primary">{user.email}</p></div>
            <div className="rounded-xl border border-border-primary bg-surface-primary p-4"><label className="text-xs text-text-tertiary uppercase tracking-wider">Email verified</label><p className={`mt-1 flex items-center gap-1.5 text-sm ${user.emailVerified ? "text-brand" : "text-warning"}`}>{user.emailVerified ? (<><span className="h-1.5 w-1.5 rounded-full bg-brand" />Yes</>) : (<><span className="h-1.5 w-1.5 rounded-full bg-warning" />Pending</>)}</p></div>
            <div className="rounded-xl border border-border-primary bg-surface-primary p-4"><label className="text-xs text-text-tertiary uppercase tracking-wider">Member since</label><p className="mt-1 text-sm text-text-primary">{new Date(user.createdAt).toLocaleDateString()}</p></div>
          </div>
        </section>

        {/* Team members */}
        <section className="border-b border-border-primary p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Team members ({members.length})</h2>
          <div className="mt-4 space-y-3">
              {members.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border-primary bg-surface-primary px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-border-border-primary to-bg-surface-tertiary text-xs font-medium text-text-secondary ring-1 ring-border-border-primary">{m.userName[0]?.toUpperCase() ?? "?"}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text-primary">{m.userName}</p>
                      <p className="text-xs text-text-tertiary">{m.userEmail}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${m.role === "admin" || m.role === "owner" ? "bg-brand/10 text-brand" : "bg-border-border-primary text-text-tertiary"}`}>{m.role}</span>
                  </div>
                ))}
            <fetcher.Form method="POST" className="mt-4 flex items-end gap-3">
              <input type="hidden" name="intent" value="invite-member" />
              <div className="flex-1">
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-text-secondary">Invite by email</label>
                <input name="email" type="email" required placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-border-primary bg-surface-primary px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:border-brand focus:outline-none transition-colors" />
              </div>
              <select name="role" defaultValue="member"
                className="rounded-lg border border-border-primary bg-surface-primary px-3.5 py-2.5 text-sm text-text-primary focus:border-brand focus:outline-none transition-all">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="inline-flex h-10 items-center rounded-[20px] bg-brand px-5 text-sm font-semibold text-black transition-all hover:bg-brand-dark hover:scale-[0.97] active:scale-[0.95] whitespace-nowrap">Invite</button>
            </fetcher.Form>
            {inviteResult?.error && <p className="text-sm text-error">{inviteResult.error}</p>}
          </div>
        </section>

        {/* Pending invitations */}
        {invitations.length > 0 && (
          <section className="border-b border-border-primary p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-warning/15">
                <svg className="h-3 w-3 text-warning" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5M8 11h.01"/></svg>
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-warning">Pending invitations ({invitations.length})</h2>
            </div>
            <div className="mt-4 space-y-2">
              {invitations.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between rounded-xl border border-border-primary bg-surface-primary px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/10 text-xs font-medium text-warning">{inv.email[0]?.toUpperCase() ?? "?"}</div>
                    <div>
                      <p className="text-sm text-text-primary">{inv.email}</p>
                      <p className="text-xs text-text-tertiary capitalize">Role: {inv.role}</p>
                    </div>
                  </div>
                  <fetcher.Form method="POST">
                    <input type="hidden" name="intent" value="cancel-invitation" />
                    <input type="hidden" name="invitationId" value={inv.id} />
                    <button type="submit" className="rounded-lg px-3 py-1.5 text-xs text-error hover:bg-error/10 transition-all duration-200">Cancel</button>
                  </fetcher.Form>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Subscription */}
        <section className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Billing</h2>
          <p className="mt-2 text-sm text-text-tertiary">Manage your plan, invoices, and payment methods on the billing page.</p>
          <a href="/dashboard/billing" className="mt-4 inline-flex h-10 items-center gap-2 rounded-[20px] bg-brand px-5 text-sm font-semibold text-black transition-all hover:bg-brand-dark hover:scale-[0.97] active:scale-[0.95]">
            Go to billing
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 4l4 4-4 4"/></svg>
          </a>
        </section>

        {/* Organization */}
        <section className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Organization</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border-primary bg-surface-primary p-4"><label className="text-xs text-text-tertiary uppercase tracking-wider">Organizations</label><p className="mt-1 text-sm text-text-primary">{orgCount}</p></div>
            <div className="rounded-xl border border-border-primary bg-surface-primary p-4"><label className="text-xs text-text-tertiary uppercase tracking-wider">Active integrations</label><p className="mt-1 text-sm text-text-primary">{integrationCount}</p></div>
          </div>
        </section>
      </div>
    </div>
  );
}
