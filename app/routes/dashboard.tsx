import { useState } from "react";
import { Outlet, Link, useLoaderData, redirect } from "react-router";
import { auth } from "~/lib/auth.server";
import { authClient } from "~/lib/auth-client";
import { db } from "~/db";
import { policyCheck } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import { plans } from "~/lib/plans";
import { hasActiveSubscription } from "~/lib/subscription-check";
import type { Route } from "./+types/dashboard";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/login");

  let orgId = session.session.activeOrganizationId;

  if (!orgId) {
    const orgs = await auth.api.listOrganizations({ headers: request.headers });
    if (orgs.length > 0) {
      await auth.api.setActiveOrganization({ body: { organizationId: orgs[0].id }, headers: request.headers });
      orgId = orgs[0].id;
    } else {
      const slug = session.user.email.split("@")[0] + "-org";
      const org = await auth.api.createOrganization({ body: { name: session.user.name + "'s Org", slug }, headers: request.headers });
      await auth.api.setActiveOrganization({ body: { organizationId: org.id }, headers: request.headers });
      orgId = org.id;
    }
  }

  const subscribed = await hasActiveSubscription(orgId, session.user.id);

  const reviewCount = subscribed ? await db.select({ count: policyCheck.id })
    .from(policyCheck)
    .where(and(eq(policyCheck.organizationId, orgId), eq(policyCheck.needsReview, true)))
    .then((rows) => rows.length) : 0;

  return { user: session.user, orgId, reviewCount, subscribed };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user, orgId, reviewCount, subscribed } = loaderData;
  const [paywallAnnual, setPaywallAnnual] = useState(false);

  if (!subscribed) {
    return (
      <div className="min-h-screen bg-[#0A0A0C]">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-lg font-bold tracking-tight text-[#F1F1F3]">Spire</span>
          <span className="text-sm text-[#8B8B93]">{user.email}</span>
        </header>
        <main className="mx-auto max-w-5xl px-6 pt-16 pb-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">
              Subscribe to use Spire<br />
              <span className="text-[#00D4AA]">start with a free trial</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[#8B8B93]">
              Connect integrations, run AI compliance audits, auto-fill security questionnaires, and export evidence packs.
            </p>
          </div>

          <div className="mx-auto mt-10 flex items-center justify-center gap-3">
            <span className={`text-sm ${!paywallAnnual ? "text-[#F1F1F3]" : "text-[#5C5C66]"}`}>Monthly</span>
            <button onClick={() => setPaywallAnnual(!paywallAnnual)}
              className={`relative h-6 w-11 rounded-full transition-colors ${paywallAnnual ? "bg-[#00D4AA]" : "bg-[#1C1C24]"}`}>
              <span className={`absolute top-0.5 left-0.5 block h-5 w-5 rounded-full bg-white transition-transform ${paywallAnnual ? "translate-x-5" : "translate-x-0"}`} />
            </button>
            <span className={`text-sm ${paywallAnnual ? "text-[#F1F1F3]" : "text-[#5C5C66]"}`}>Annual <span className="text-[#00D4AA]">(save ~17%)</span></span>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const price = paywallAnnual ? plan.annual : plan.monthly;
              return (
                <div key={plan.name} className={`relative rounded-xl border p-6 ${plan.popular ? "border-[#00D4AA]/40 bg-[#111116]" : "border-[#1C1C24] bg-[#111116]"}`}>
                  {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#00D4AA] px-4 py-0.5 text-xs font-medium text-black">Most popular</span>}
                  <h2 className="text-lg font-bold text-[#F1F1F3]">{plan.name}</h2>
                  <p className="mt-1 text-sm text-[#8B8B93]">{plan.desc}</p>
                  <div className="mt-4 flex items-baseline gap-0.5">
                    <span className="text-3xl font-bold text-[#F1F1F3]">£{price.toLocaleString()}</span>
                    <span className="text-sm text-[#5C5C66]">{paywallAnnual ? "/yr" : "/mo"}</span>
                  </div>
                  <ul className="mt-5 space-y-2 text-sm text-[#8B8B93]">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2"><svg className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4AA]" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>{f}</li>
                    ))}
                  </ul>
                  <button onClick={() => authClient.subscription.upgrade({ plan: plan.slug, referenceId: orgId, customerType: "organization", successUrl: window.location.href, cancelUrl: window.location.href })}
                    className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${plan.popular ? "bg-[#00D4AA] text-black hover:bg-[#00B894]" : "border border-[#1C1C24] text-[#F1F1F3] hover:border-[#00D4AA]"}`}>
                    {plan.name === "Enterprise" ? "Book a demo" : "Start free trial"}
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

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
          <p className="mt-0.5 truncate text-xs text-[#5C5C66]">{user.email}</p>
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
        <Outlet context={{ orgId }} />
      </main>
    </div>
  );
}
