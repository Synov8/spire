import { db } from "~/db";
import { policyCheck } from "~/db/schema";
// `AuditReportSchema` itself lives in `./audit-schema.ts` so the same schema
// can be imported by `scripts/self-audit.ts` without dragging in `~/db`.
import type { AuditReport } from "./audit-schema";
export { AuditReportSchema } from "./audit-schema";

/**
 * Persist an audit report to the Drizzle `policyCheck` table.
 * One row per verdict, one row per gap — both swim in the same table with
 * `needsReview: true` set for warnings / gaps so they surface in the
 * "Gaps needing attention" dashboard widget.
 */
export async function storeAuditReport(organizationId: string, report: AuditReport) {
  for (const v of report.verdicts) {
    await db.insert(policyCheck).values({
      id: `agent-${v.controlId}-${Date.now()}`,
      ruleId: `agent-${v.controlId}`,
      organizationId,
      status: v.status,
      detail: v.detail,
      needsReview: v.status === "warning",
      lastCheckedAt: new Date(),
      createdAt: new Date(),
    });
  }
  for (const gap of report.gapsNeedingHumanInput) {
    await db.insert(policyCheck).values({
      id: `gap-${gap.controlId || "general"}-${Date.now()}`,
      ruleId: `agent-${gap.controlId || "general"}`,
      organizationId,
      status: "warning",
      detail: gap.description + " " + gap.suggestedAction,
      needsReview: true,
      lastCheckedAt: new Date(),
      createdAt: new Date(),
    });
  }
}
