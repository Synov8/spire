import { db } from "~/db";
import { policyCheck } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import type { ControlVerdict } from "./audit-schema";

/**
 * Persist an audit report to the Drizzle `policyCheck` table.
 * Deletes previous agent-generated rows for the org first, then inserts fresh ones.
 */
export async function storeAuditReport(organizationId: string, report: { summary: string; controls: Record<string, ControlVerdict> }) {
  // wipe previous agent runs so we don't accumulate duplicates
  await db.delete(policyCheck).where(
    and(eq(policyCheck.organizationId, organizationId), eq(policyCheck.ruleId!, "agent-audit")),
  );

  for (const [controlId, v] of Object.entries(report.controls)) {
    await db.insert(policyCheck).values({
      id: `agent-${controlId}-${Date.now()}`,
      ruleId: "agent-audit",
      organizationId,
      status: v.status === "needs-human-input" ? "warning" : v.status,
      detail: v.detail + (v.suggestedAction ? ` ${v.suggestedAction}` : ""),
      needsReview: v.status === "warning" || v.status === "needs-human-input",
      lastCheckedAt: new Date(),
      createdAt: new Date(),
    });
  }
}
