import { generateText, stepCountIs, Output } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { db } from "~/db";
import { control, organization } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { storeAuditReport, AuditReportSchema } from "./compliance-agent";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

const model = openrouter.chat("deepseek/deepseek-v4-flash", {
  temperature: 0,
  reasoning: { effort: "xhigh" },
});

export async function runComplianceAudit(organizationId: string) {
  const controlsList = await db.select().from(control).where(eq(control.framework, "soc2"));
  if (controlsList.length === 0) return { error: "No SOC 2 controls seeded." };

  const composio = new Composio({ provider: new VercelProvider(), apiKey: process.env.COMPOSIO_API_KEY || "" });

  const org = await db.select().from(organization).where(eq(organization.id, organizationId)).limit(1).then((r) => r[0]);
  const existingSessionId = (org?.metadata as Record<string, unknown> | null)?.composioSessionId as string | undefined;

  let composioSession;
  if (existingSessionId) {
    try { composioSession = await composio.use(existingSessionId); }
    catch { composioSession = await composio.create(organizationId); }
  } else {
    composioSession = await composio.create(organizationId);
  }

  await db.update(organization).set({
    metadata: { ...(org?.metadata as Record<string, unknown> || {}), composioSessionId: composioSession.sessionId },
  }).where(eq(organization.id, organizationId));

  const tools = await composioSession.tools();

  const result = await generateText({
    model,
    tools,
    output: Output.object({ schema: AuditReportSchema, name: "AuditReport", description: "SOC 2 compliance audit results" }),
    stopWhen: stepCountIs(50),
    prompt: `You are a compliance auditor. Run a full audit for organization ${organizationId}.

SOC 2 controls:
${controlsList.filter((c) => c.framework === "soc2").map((c) => `${c.controlId} (${c.category}): ${c.title} — ${c.description}`).join("\n")}

AI Act controls:
${controlsList.filter((c) => c.framework === "ai-act").map((c) => `${c.controlId}: ${c.title} — ${c.description}`).join("\n")}

Composio tools are available for connected integrations. For each control, probe the relevant API and record pass/fail/warning. Controls that need documentation (policies, training records, risk assessments, public AI page) should be listed as gaps needing human input.`,
  });

  if (!result.output) return { error: "Agent did not produce a structured audit report." };

  await storeAuditReport(organizationId, result.output);

  return {
    completed: true as const,
    verdicts: result.output.verdicts,
    summary: result.output.summary,
    gaps: result.output.gapsNeedingHumanInput,
  };
}
