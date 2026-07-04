import { generateText, Output } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { db } from "~/db";
import { policyCheck, control } from "~/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY || "" });

const model = openrouter.chat("deepseek/deepseek-v4-flash", {
  temperature: 0,
  reasoning: { effort: "xhigh" },
});

const EvaluationSchema = z.object({
  status: z.enum(["pass", "fail", "warning", "unknown"]),
  detail: z.string(),
});

export async function reviewEvaluate(
  orgId: string,
  controlId: string,
  userText: string,
  fileContent: string | null,
  filename: string | null,
) {
  const allChecks = await db.select().from(policyCheck).where(eq(policyCheck.organizationId, orgId));
  const ctrl = await db.select().from(control).where(eq(control.controlId, controlId)).limit(1).then((r) => r[0]);
  if (!ctrl) throw new Error(`Control ${controlId} not found`);

  const checksContext = allChecks
    .map((c) => `${c.ruleId}: ${c.status} — ${c.detail || "no detail"}`)
    .join("\n");

  let evidenceBlock = `User's response: ${userText}`;
  if (fileContent) {
    evidenceBlock += `\n\n--- ${filename} ---\n${fileContent}`;
  }

  const { output } = await generateText({
    model,
    output: Output.object({ schema: EvaluationSchema }),
    prompt: [
      `You are evaluating a compliance control after a user has submitted evidence.`,
      ``,
      `Org's current compliance posture (all controls):`,
      checksContext,
      ``,
      `Control being re-evaluated: ${ctrl.controlId} (${ctrl.category}) — ${ctrl.title}`,
      ctrl.description,
      ``,
      `Evidence provided by the user:`,
      evidenceBlock,
      ``,
      `Re-evaluate this control based on the evidence. Return a status and updated detail.`,
    ].join("\n"),
  });

  return output;
}
