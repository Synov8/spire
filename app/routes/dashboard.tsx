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
  overview: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8.5l6-6 6 6M4 7v5h3v-3h2v3h3V7M1 14h14"/></svg>,
  integrations: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1"/><rect x="9" y="2.5" width="4.5" height="4.5" rx="1"/><rect x="2.5" y="9" width="4.5" height="4.5" rx="1"/><rect x="9" y="9" width="4.5" height="4.5" rx="1"/></svg>,
  questionnaires: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M5 5h6M5 8h4M5 11h3"/></svg>,
  review: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5l5.5 2v4c0 3.5-2.5 6-5.5 7-3-1-5.5-3.5-5.5-7v-4l5.5-2z"/><path d="M5.5 8l2 2 3-3.5"/></svg>,
  billing: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/><path d="M1.5 7h13M4 10.5h2.5"/></svg>,
  settings: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1.5V3M8 13v1.5M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M1.5 8H3M13 8h1.5M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/></svg>,
  chevronDown: <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6l4 4 4-4"/></svg>,
  signOut: <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M6 8h8"/></svg>,
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
        {/* Logo + org switcher */}
        <div className="flex h-14 items-center gap-3 border-b border-[#1A1D1E] px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#00B894] text-[11px] font-bold text-black shadow-[0_2px_8px_-2px_rgba(0,212,170,0.4)]">S</div>
          <div className="flex-1 truncate">
            <div className="relative">
              <button onClick={() => setOrgOpen(!orgOpen)} className="flex w-full items-center gap-1.5 text-sm font-medium text-[#E8E8E8] hover:text-white transition-colors">
                <span className="truncate max-w-36">{currentOrgName || "No org"}</span>
                <span className={`text-[#4A4D4E] transition-transform duration-200 ${orgOpen ? "rotate-180" : ""}`}>{icons.chevronDown}</span>
              </button>
              {orgOpen && (
                <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-lg border border-[#1A1D1E] bg-[#0B0D0E] py-1 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5)]">
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

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((l) => {
            const active = l.to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to}
                className={`group relative flex items-center justify-between overflow-hidden rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                  active
                    ? "bg-[#00D4AA]/[0.08] text-[#E8E8E8]"
                    : "text-[#6A6D6E] hover:bg-[#141718] hover:text-[#E8E8E8]"
                }`}>
                {/* Active indicator bar */}
                {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-[#00D4AA]" />}
                <span className="flex items-center gap-3">
                  <span className={`transition-colors ${active ? "text-[#00D4AA]" : "text-[#4A4D4E] group-hover:text-[#8B8B93]"}`}>{l.icon}</span>
                  {l.label}
                </span>
                {l.badge !== undefined && l.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F59E0B]/15 px-1.5 text-[10px] font-medium text-[#F59E0B]">
                    {l.badge > 99 ? "99+" : l.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-[#1A1D1E] p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#6A6D6E]">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#1C1C24] to-[#141718] text-[10px] font-medium text-[#8B8B93] ring-1 ring-[#1A1D1E]">{user.email[0].toUpperCase()}</div>
            <span className="flex-1 truncate">{user.email}</span>
          </div>
          <form action="/logout" method="POST" className="mt-1">
            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#4A4D4E] hover:bg-[#141718] hover:text-[#EF4444] transition-all duration-200">
              {icons.signOut}
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {/* Subtle dot-grid background for depth (matches HeroDemo) */}
        <div className="pointer-events-none fixed inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle, #2C2C36 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative mx-auto max-w-6xl p-6 lg:p-8">
          <Outlet context={{ orgId, subscribed }} />
        </div>
      </main>
    </div>
  );
}
