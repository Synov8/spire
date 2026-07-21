export function meta() {
  return [{ title: "Billing | Spire" }, { name: "description", content: "Manage your subscription and billing" }];
}

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
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Billing</h1>
        <p className="mt-1 text-sm text-text-tertiary">Manage your subscription and billing details</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-border-primary bg-surface-secondary">
        {/* Header with gradient */}
        <div className="flex items-center gap-3 border-b border-border-primary bg-gradient-to-r from-brand/[0.05] to-transparent px-6 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/><path d="M1.5 7h13M4 10.5h2.5"/></svg>
          </span>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Current plan</h2>
            <p className="text-xs text-text-tertiary">Your subscription and billing cycle</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold capitalize text-text-primary">{sub ? sub.plan : "Free"}</span>
            {sub?.status === "trialing" && (
              <span className="flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />Trial
              </span>
            )}
          </div>
          {sub && (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border-primary bg-surface-primary p-4">
                <p className="text-xs text-text-tertiary uppercase tracking-wider">Status</p>
                <p className="mt-1 text-sm font-medium capitalize text-text-primary">{sub.status}</p>
              </div>
              {sub.billingInterval && (
                <div className="rounded-xl border border-border-primary bg-surface-primary p-4">
                  <p className="text-xs text-text-tertiary uppercase tracking-wider">Billing</p>
                  <p className="mt-1 text-sm font-medium capitalize text-text-primary">{sub.billingInterval}</p>
                </div>
              )}
              {sub.periodEnd && (
                <div className="rounded-xl border border-border-primary bg-surface-primary p-4">
                  <p className="text-xs text-text-tertiary uppercase tracking-wider">Period ends</p>
                  <p className="mt-1 text-sm font-medium text-text-primary">{new Date(sub.periodEnd).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}
          {sub?.cancelAtPeriodEnd && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3 text-sm text-warning">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5M8 11h.01"/></svg>
              Cancels at period end
            </div>
          )}
          <div className="mt-6 flex gap-3">
            {sub ? (
              <>
                <button type="button" onClick={manageBilling} className="inline-flex h-10 items-center rounded-[20px] border border-border-primary px-5 text-sm font-medium text-text-secondary transition-all hover:border-brand/40 hover:text-text-primary">Manage billing</button>
                <button type="button" onClick={cancelSubscription} className="inline-flex h-10 items-center rounded-[20px] border border-error/30 px-5 text-sm font-medium text-error transition-all hover:border-error/60 hover:bg-error/[0.04]">Cancel subscription</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => upgrade("starter")} className="inline-flex h-10 items-center rounded-[20px] border border-border-primary px-5 text-sm font-medium text-text-primary transition-all hover:border-brand/40 hover:text-text-primary">Upgrade to Starter - £200/mo</button>
                <button type="button" onClick={() => upgrade("growth")} className="inline-flex h-10 items-center rounded-[20px] bg-brand px-5 text-sm font-semibold text-black transition-all hover:bg-brand-dark hover:scale-[0.97] active:scale-[0.95] shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">Upgrade to Growth - £1,200/mo</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
