import { generateText, dynamicTool } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { db } from "~/db";
import { control, organization } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { storeAuditReport } from "./compliance-agent";
import { buildAuditSchema } from "./audit-schema";

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
  const controlIds = controlsList.map((c) => c.controlId);
  const AuditSchema = buildAuditSchema(controlIds);

  const allTools = {
    ...tools,
    submitAuditReport: dynamicTool({
      description: "Submit the complete audit report with a verdict for every control.",
      inputSchema: AuditSchema,
      execute: async (report) => report,
    }),
  };

  const result = await generateText({
    model,
    tools: allTools,
    prompt: `You are a compliance auditor. Run a full audit for organization ${organizationId}.

${controlsList.map((c) => `${c.controlId} (${c.category}): ${c.title} — ${c.description}`).join("\n")}

Composio tools are available for connected integrations. For each control, probe the relevant API and record pass/fail/warning. Controls that need documentation should be listed with status "needs-human-input".

When you have checked all controls, call "submitAuditReport" with the complete report.`,
  });

  const submitResult = (result.toolResults as any[]).find((r: any) => r.toolName === "submitAuditReport");
  if (!submitResult?.output) return { error: "Agent did not produce a structured audit report." };

  const report = submitResult.output as { summary: string; controls: Record<string, { status: string; detail: string; evidenceSources: string[] | null; suggestedAction: string | null }> };

  await storeAuditReport(organizationId, report as any);

  const verdicts = Object.entries(report.controls).map(([id, v]) => ({ controlId: id, ...v }));
  const gaps = verdicts.filter((v) => v.status === "needs-human-input");

  return {
    completed: true as const,
    verdicts,
    summary: report.summary,
    gaps,
  };
}
