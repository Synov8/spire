import { Outlet, Link, useLoaderData, redirect } from "react-router";
import { auth } from "~/lib/auth.server";
import { authClient } from "~/lib/auth-client";
import { db } from "~/db";
import { policyCheck } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import { hasActiveSubscription } from "~/lib/subscription-check";
import type { Route } from "./+types/dashboard";
import { useState } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/login");

  let orgId = session.session.activeOrganizationId;
  let orgs: Array<{ id: string; name: string; slug: string; logo: string | null }> = [];

  if (!orgId) {
    orgs = await auth.api.listOrganizations({ headers: request.headers }) as any;
    if (orgs.length > 0) {
      await auth.api.setActiveOrganization({ body: { organizationId: orgs[0].id }, headers: request.headers });
      orgId = orgs[0].id;
    } else {
      const slug = session.user.email.split("@")[0] + "-org";
      const org = await auth.api.createOrganization({ body: { name: session.user.name + "'s Org", slug }, headers: request.headers });
      await auth.api.setActiveOrganization({ body: { organizationId: org.id }, headers: request.headers });
      orgId = org.id;
      orgs = [{ id: org.id, name: org.name, slug: org.slug, logo: null }];
    }
  } else {
    orgs = await auth.api.listOrganizations({ headers: request.headers }) as any;
  }

  const subscribed = await hasActiveSubscription(orgId, session.user.id);

  const reviewCount = subscribed ? await db.select({ count: policyCheck.id })
    .from(policyCheck)
    .where(and(eq(policyCheck.organizationId, orgId), eq(policyCheck.needsReview, true)))
    .then((rows) => rows.length) : 0;

  const currentOrg = orgs.find((o) => o.id === orgId);

  return { user: session.user, orgId, reviewCount, subscribed, orgs, currentOrgName: currentOrg?.name ?? "" };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user, orgId, reviewCount, subscribed, orgs, currentOrgName } = loaderData;
  const [orgOpen, setOrgOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: "Overview" },
    { to: "/dashboard/integrations", label: "Integrations" },
    { to: "/dashboard/questionnaires", label: "Questionnaires" },
    { to: "/dashboard/review", label: "Review", badge: reviewCount },
    { to: "/dashboard/billing", label: "Billing" },
    { to: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0A0A0C]">
      <aside className="flex w-52 flex-col border-r border-[#1C1C24] bg-[#111116] p-4">
        <div className="mb-6">
          <Link to="/dashboard" className="text-lg font-bold tracking-tight text-[#00D4AA]">Spire</Link>
          <div className="relative mt-1.5">
            <button onClick={() => setOrgOpen(!orgOpen)} className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[#8B8B93] hover:bg-[#1C1C24] transition-colors">
              <span className="truncate max-w-28">{currentOrgName || "No org"}</span>
              <svg className={`h-3 w-3 shrink-0 transition-transform ${orgOpen ? "rotate-180" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4" /></svg>
            </button>
            {orgOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-[#1C1C24] bg-[#111116] py-1 shadow-lg">
                {orgs.map((o) => (
                  <button key={o.id} onClick={async () => { setOrgOpen(false); await authClient.organization.setActive({ organizationId: o.id }); window.location.reload(); }}
                    className={`block w-full px-3 py-1.5 text-left text-xs transition-colors ${o.id === orgId ? "text-[#00D4AA]" : "text-[#8B8B93] hover:bg-[#1C1C24]"}`}>
                    {o.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="mt-1 truncate text-xs text-[#5C5C66]">{user.email}</p>
        </div>
        <nav className="flex-1 space-y-0.5">
          {links.map((l) => (
            <Link key={l.to} to={l.to}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#8B8B93] hover:bg-[#1C1C24] hover:text-[#F1F1F3] transition-colors">
              <span>{l.label}</span>
              {l.badge !== undefined && l.badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F59E0B] px-1.5 text-[10px] font-bold text-black">
                  {l.badge > 99 ? "99+" : l.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <form action="/logout" method="POST" className="border-t border-[#1C1C24] pt-4">
          <button type="submit" className="w-full rounded-lg px-3 py-2 text-sm text-[#EF4444] hover:bg-[#1C1C24] transition-colors">Sign out</button>
        </form>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet context={{ orgId, subscribed }} />
      </main>
    </div>
  );
}
