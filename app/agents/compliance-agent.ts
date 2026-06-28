import { z } from "zod";
import { db } from "~/db";
import { policyCheck } from "~/db/schema";

export const AuditReportSchema = z.object({
  summary: z.object({
    totalVerified: z.number().describe("Number of controls that passed verification"),
    totalFailed: z.number().describe("Number of controls that failed"),
    totalWarnings: z.number().describe("Number of controls that could not be fully verified"),
    overallAssessment: z.string().describe("One-sentence summary of the compliance posture"),
  }),
  verdicts: z.array(z.object({
    controlId: z.string().describe("The control ID from any framework, e.g. CC6-1, A1-2, AI-3"),
    status: z.enum(["pass", "fail", "warning"]),
    detail: z.string().describe("What was checked, what the APIs returned, and the verdict rationale"),
    evidenceSources: z.array(z.string()).describe("The Composio tools/APIs used to check this control"),
  })).describe("Results for every SOC 2 control that was verifiable via infrastructure APIs"),
  gapsNeedingHumanInput: z.array(z.object({
    controlId: z.string().optional(),
    description: z.string().describe("What could not be verified automatically"),
    suggestedAction: z.string().describe("What the user should do — upload a document, configure a tool, etc."),
  })).describe("Controls that need the user to provide documentation or manual evidence"),
});

export type AuditReport = z.infer<typeof AuditReportSchema>;

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
