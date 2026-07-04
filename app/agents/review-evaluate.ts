import { generateText, Output } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { db } from "~/db";
import { policyCheck, control } from "~/db/schema";
import { eq, ne } from "drizzle-orm";
import { z } from "zod";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY || "" });

const model = openrouter.chat("deepseek/deepseek-v4-flash", {
  temperature: 0,
  reasoning: { effort: "xhigh" },
});

const EvalEntrySchema = z.object({
  controlId: z.string(),
  status: z.enum(["pass", "fail", "warning", "unknown"]),
  detail: z.string(),
});

const BatchSchema = z.object({
  evaluations: z.array(EvalEntrySchema),
});

export async function batchReviewEvaluate(
  orgId: string,
  controlIds: string[],
  userText: string,
  fileContent: string | null,
  filename: string | null,
): Promise<Record<string, { status: string; detail: string }>> {
  const allChecks = await db.select().from(policyCheck).where(eq(policyCheck.organizationId, orgId));
  const controlsList = await db.select().from(control).where(ne(control.framework, "none"));

  const passingChecks = allChecks.filter((c) => c.status === "pass");
  const checksContext = passingChecks.length > 0
    ? passingChecks.map((c) => `${c.ruleId}: ${c.status} — ${c.detail || "no detail"}`).join("\n")
    : "No passing controls yet.";

  const controlsContext = controlIds.map((id) => {
    const c = controlsList.find((c) => c.controlId === id);
    return c ? `${c.controlId} (${c.category}): ${c.title} — ${c.description}` : id;
  }).join("\n");

  let evidenceBlock = `User's response: ${userText}`;
  if (fileContent) {
    evidenceBlock += `\n\n--- ${filename} ---\n${fileContent}`;
  }

  const { output } = await generateText({
    model,
    output: Output.object({ schema: BatchSchema }),
    prompt: [
      `You are evaluating compliance controls after a user has submitted evidence.`,
      ``,
      `Org's current compliance posture (all controls):`,
      checksContext,
      ``,
      `Controls needing re-evaluation:`,
      controlsContext,
      ``,
      `Evidence provided by the user:`,
      evidenceBlock,
      ``,
      `Re-evaluate EACH control listed above based on the evidence. The evidence for one control may affect others.`,
      `Return an evaluation for every control listed, with a status and updated detail for each.`,
      `Statuses: pass = control is satisfied, fail = evidence shows it isn't met, warning = partially met, unknown = cannot determine.`,
    ].join("\n"),
  });

  const result: Record<string, { status: string; detail: string }> = {};
  for (const e of output.evaluations) {
    result[e.controlId] = { status: e.status, detail: e.detail };
  }
  return result;
}
