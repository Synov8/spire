import { Outlet, Link, useLoaderData, redirect, useLocation } from "react-router";
import { auth } from "~/lib/auth.server";
import { authClient } from "~/lib/auth-client";
import { db } from "~/db";
import { policyCheck } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import { hasActiveSubscription } from "~/lib/subscription-check";
import type { Route } from "./+types/dashboard";
import { useState } from "react";

const icons = {
  overview: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8.5l6-6 6 6M4 7v5h3v-3h2v3h3V7M1 14h14"/></svg>,
  integrations: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h8v8H4z"/><path d="M8 8l1.5-1.5M8 8l-1.5 1.5M8 8l-1.5-1.5M8 8l1.5 1.5"/></svg>,
  questionnaires: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M5 5h6M5 8h4M5 11h3"/></svg>,
  review: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5M8 11h.01"/></svg>,
  billing: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="14" height="8" rx="1"/><path d="M4 8h8"/></svg>,
  settings: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2"/><path d="M8 1.5V3M8 13v1.5M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M1.5 8H3M13 8h1.5M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/></svg>,
  chevronDown: <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6l4 4 4-4"/></svg>,
  signOut: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M6 8h8"/></svg>,
};

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
  const { pathname } = useLocation();
  const [orgOpen, setOrgOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: "Overview", icon: icons.overview },
    { to: "/dashboard/integrations", label: "Integrations", icon: icons.integrations },
    { to: "/dashboard/questionnaires", label: "Questionnaires", icon: icons.questionnaires },
    { to: "/dashboard/review", label: "Review", icon: icons.review, badge: reviewCount },
    { to: "/dashboard/billing", label: "Billing", icon: icons.billing },
    { to: "/dashboard/settings", label: "Settings", icon: icons.settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#07080A]">
      <aside className="flex w-64 flex-col border-r border-[#1A1D1E] bg-[#0B0D0E]">
        <div className="flex h-14 items-center gap-3 border-b border-[#1A1D1E] px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00D4AA] text-[10px] font-bold text-black">S</div>
          <div className="flex-1 truncate">
            <div className="relative">
              <button onClick={() => setOrgOpen(!orgOpen)} className="flex w-full items-center gap-1.5 text-sm font-medium text-[#E8E8E8] hover:text-white transition-colors">
                <span className="truncate max-w-36">{currentOrgName || "No org"}</span>
                <span className={`text-[#4A4D4E] transition-transform ${orgOpen ? "rotate-180" : ""}`}>{icons.chevronDown}</span>
              </button>
              {orgOpen && (
                <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-[#1A1D1E] bg-[#0B0D0E] py-1 shadow-xl">
                  {orgs.map((o) => (
                    <button key={o.id} onClick={async () => { setOrgOpen(false); await authClient.organization.setActive({ organizationId: o.id }); window.location.reload(); }}
                      className={`block w-full px-3 py-1.5 text-left text-xs transition-colors ${o.id === orgId ? "text-[#00D4AA]" : "text-[#6A6D6E] hover:text-[#E8E8E8] hover:bg-[#141718]"}`}>
                      {o.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {links.map((l) => {
            const active = l.to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[#141718] text-[#E8E8E8]"
                    : "text-[#6A6D6E] hover:bg-[#141718] hover:text-[#E8E8E8]"
                }`}>
                <span className="flex items-center gap-3">
                  <span className={active ? "text-[#00D4AA]" : "text-[#4A4D4E]"}>{l.icon}</span>
                  {l.label}
                </span>
                {l.badge !== undefined && l.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F59E0B]/10 px-1.5 text-[10px] font-medium text-[#F59E0B]">
                    {l.badge > 99 ? "99+" : l.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#1A1D1E] p-2">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#4A4D4E]">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#141718] text-[10px] font-medium text-[#6A6D6E]">{user.email[0].toUpperCase()}</div>
            <span className="flex-1 truncate">{user.email}</span>
          </div>
          <form action="/logout" method="POST" className="mt-0.5">
            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#4A4D4E] hover:bg-[#141718] hover:text-[#EF4444] transition-colors">
              {icons.signOut}
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-6 lg:p-8">
          <Outlet context={{ orgId, subscribed }} />
        </div>
      </main>
    </div>
  );
}
