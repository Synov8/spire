import { useLoaderData } from "react-router";
import { auth } from "~/lib/auth.server";
import { db } from "~/db";
import { authClient } from "~/lib/auth-client";
import { subscription } from "~/db/schema";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/dashboard.billing";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { sub: null, orgId: "" };
  const orgId = session.session.activeOrganizationId!;
  const subs = await db.select().from(subscription).where(eq(subscription.referenceId, orgId));
  return { sub: subs[0] || null, orgId };
}

export default function BillingPage({ loaderData }: Route.ComponentProps) {
  const { sub, orgId } = loaderData;

  const upgrade = async (plan: string) => {
    await authClient.subscription.upgrade({
      plan,
      referenceId: orgId,
      customerType: "organization",
      successUrl: `${window.location.origin}/dashboard/billing`,
      cancelUrl: `${window.location.origin}/dashboard/billing`,
    });
  };

  const manageBilling = async () => {
    await authClient.subscription.cancel({
      referenceId: orgId,
      customerType: "organization",
      returnUrl: `${window.location.origin}/dashboard/billing`,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Billing</h1>
      <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8B8B93]">Current plan</h2>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-[#F1F1F3]">{sub ? sub.plan : "Free"}</span>
          {sub?.status === "trialing" && <span className="rounded bg-[#00D4AA]/10 px-2 py-0.5 text-xs text-[#00D4AA]">Trial</span>}
        </div>
        {sub && (
          <div className="mt-4 space-y-2 text-sm text-[#8B8B93]">
            <p>Status: <span className="capitalize text-[#F1F1F3]">{sub.status}</span></p>
            {sub.billingInterval && <p>Billing: <span className="capitalize text-[#F1F1F3]">{sub.billingInterval}</span></p>}
            {sub.periodEnd && <p>Period ends: <span className="text-[#F1F1F3]">{new Date(sub.periodEnd).toLocaleDateString()}</span></p>}
            {sub.cancelAtPeriodEnd && <p className="text-[#F59E0B]">Cancels at period end</p>}
          </div>
        )}
        <div className="mt-6 flex gap-3">
          {sub ? (
            <button onClick={manageBilling} className="rounded-lg border border-[#1C1C24] px-4 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors">Manage billing</button>
          ) : (
            <>
              <button onClick={() => upgrade("starter")} className="rounded-lg border border-[#1C1C24] px-4 py-2 text-sm font-medium text-[#F1F1F3] hover:border-[#00D4AA] transition-colors">Upgrade to Starter — £200/mo</button>
              <button onClick={() => upgrade("growth")} className="rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-colors">Upgrade to Growth — £1,200/mo</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
