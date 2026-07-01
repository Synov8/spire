/**
 * Pure zod schema for the compliance audit structured output.
 *
 * Shared by:
 *   - `app/agents/compliance-agent.ts` — server-side runtime: re-exports from
 *     here and uses the schema with the webapp's webapp-scoped
 *     `generateText`/`streamText` calls. The agent's `storeAuditReport` (which
 *     writes verdicts to the `policyCheck` Drizzle table) lives in that file
 *     and imports from `~/db`.
 *   - `scripts/self-audit.ts` — CLI dogfooding script. Imports ONLY this file
 *     so the script doesn't pull Drizzle / `~/db` into its module graph at
 *     startup (which would crash before env vars are loaded).
 *
 * Keeping this file's imports zod-only is what makes the CLI portable.
 */

import { z } from "zod";

export const AuditReportSchema = z.object({
  summary: z.object({
    totalVerified: z.number().describe("Number of controls that passed verification"),
    totalFailed: z.number().describe("Number of controls that failed"),
    totalWarnings: z.number().describe("Number of controls that could not be fully verified"),
    overallAssessment: z.string().describe("One-sentence summary of the compliance posture"),
  }),
  verdicts: z.array(
    z.object({
      controlId: z.string().describe("The control ID from any framework, e.g. CC6-1, A1-2, AI-3"),
      status: z.enum(["pass", "fail", "warning"]),
      detail: z.string().describe("What was checked, what the APIs returned, and the verdict rationale"),
      evidenceSources: z.array(z.string()).describe("The Composio tools/APIs used to check this control"),
    }),
  ).describe("Results for every SOC 2 control that was verifiable via infrastructure APIs"),
  gapsNeedingHumanInput: z.array(
    z.object({
      controlId: z.string().optional(),
      description: z.string().describe("What could not be verified automatically"),
      suggestedAction: z.string().describe("What the user should do — upload a document, configure a tool, etc."),
    }),
  ).describe("Controls that need the user to provide documentation or manual evidence"),
});

export type AuditReport = z.infer<typeof AuditReportSchema>;
