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
    await authClient.subscription.billingPortal({
      referenceId: orgId,
      customerType: "organization",
      returnUrl: `${window.location.origin}/dashboard/billing`,
    });
  };

  const cancelSubscription = async () => {
    await authClient.subscription.cancel({
      referenceId: orgId,
      customerType: "organization",
      returnUrl: `${window.location.origin}/dashboard/billing`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Billing</h1>
        <p className="mt-1 text-sm text-[#6A6D6E]">Manage your subscription and billing details</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#1A1D1E] bg-[#0B0D0E]">
        {/* Header with gradient */}
        <div className="flex items-center gap-3 border-b border-[#1A1D1E] bg-gradient-to-r from-[#00D4AA]/[0.05] to-transparent px-6 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00D4AA]/10 text-[#00D4AA]">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/><path d="M1.5 7h13M4 10.5h2.5"/></svg>
          </span>
          <div>
            <h2 className="text-sm font-semibold text-[#F1F1F3]">Current plan</h2>
            <p className="text-xs text-[#5C5C66]">Your subscription and billing cycle</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold capitalize text-[#F1F1F3]">{sub ? sub.plan : "Free"}</span>
            {sub?.status === "trialing" && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#00D4AA]/10 px-2.5 py-0.5 text-xs font-medium text-[#00D4AA]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" />Trial
              </span>
            )}
          </div>
          {sub && (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#1A1D1E] bg-[#07080A] p-4">
                <p className="text-xs text-[#5C5C66] uppercase tracking-wider">Status</p>
                <p className="mt-1 text-sm font-medium capitalize text-[#F1F1F3]">{sub.status}</p>
              </div>
              {sub.billingInterval && (
                <div className="rounded-xl border border-[#1A1D1E] bg-[#07080A] p-4">
                  <p className="text-xs text-[#5C5C66] uppercase tracking-wider">Billing</p>
                  <p className="mt-1 text-sm font-medium capitalize text-[#F1F1F3]">{sub.billingInterval}</p>
                </div>
              )}
              {sub.periodEnd && (
                <div className="rounded-xl border border-[#1A1D1E] bg-[#07080A] p-4">
                  <p className="text-xs text-[#5C5C66] uppercase tracking-wider">Period ends</p>
                  <p className="mt-1 text-sm font-medium text-[#F1F1F3]">{new Date(sub.periodEnd).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}
          {sub?.cancelAtPeriodEnd && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/[0.06] px-4 py-3 text-sm text-[#F59E0B]">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5M8 11h.01"/></svg>
              Cancels at period end
            </div>
          )}
          <div className="mt-6 flex gap-3">
            {sub ? (
              <>
                <button onClick={manageBilling} className="rounded-lg border border-[#1A1D1E] px-4 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-all duration-200">Manage billing</button>
                <button onClick={cancelSubscription} className="rounded-lg border border-[#EF4444]/30 px-4 py-2 text-sm font-medium text-[#EF4444] hover:border-[#EF4444]/60 hover:bg-[#EF4444]/[0.04] transition-all duration-200">Cancel subscription</button>
              </>
            ) : (
              <>
                <button onClick={() => upgrade("starter")} className="rounded-lg border border-[#1A1D1E] px-5 py-2 text-sm font-medium text-[#F1F1F3] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-all duration-200">Upgrade to Starter — £200/mo</button>
                <button onClick={() => upgrade("growth")} className="rounded-lg bg-[#00D4AA] px-5 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">Upgrade to Growth — £1,200/mo</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
