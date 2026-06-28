import { db } from "~/db";
import { subscription } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function hasActiveSubscription(orgId: string, userId: string) {
  const subs = await db.select().from(subscription).where(eq(subscription.referenceId, orgId));
  const active = subs.find((s) => s.status === "active" || s.status === "trialing");
  if (active) return true;
  // Also check user-level subscription (legacy)
  const userSubs = await db.select().from(subscription).where(eq(subscription.referenceId, userId));
  return !!userSubs.find((s) => s.status === "active" || s.status === "trialing");
}
