/**
 * Pure zod schema factory for the compliance audit structured output.
 *
 * Exports `buildAuditSchema(controlIds)` which generates a z.object where every
 * control ID is a **required** key. This produces JSON Schema with a `required`
 * array — forcing the model to produce a verdict for every single control
 * instead of cherry-picking a handful.
 *
 * The summary only contains the `overallAssessment` string; all numeric counts
 * (verified, failed, warnings, gaps) are derived from the controls object.
 *
 * Shared by:
 *   - `app/agents/compliance-agent.ts` — server-side runtime
 *   - `scripts/self-audit.ts` — CLI dogfooding script (imports ONLY this file
 *     so the script doesn't pull Drizzle / `~/db` at startup)
 */

import { z } from "zod";

export const ControlVerdictSchema = z.object({
  status: z.enum(["pass", "fail", "warning", "unknown"]),
  detail: z.string().describe("What was checked and the rationale"),
  evidenceSources: z.array(z.string()).nullable().describe("APIs/tools used to check this control"),
  suggestedAction: z.string().nullable().describe("What the user should do to close this gap"),
});

export type ControlVerdict = z.infer<typeof ControlVerdictSchema>;

export function buildAuditSchema(controlIds: string[]) {
  const controlShape: Record<string, z.ZodTypeAny> = {};
  for (const id of controlIds) {
    controlShape[id] = ControlVerdictSchema;
  }
  return z.object(controlShape);
}

export type AuditReport = z.infer<ReturnType<typeof buildAuditSchema>>;
