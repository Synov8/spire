import { task, streams } from "@trigger.dev/sdk";
import { streamText, dynamicTool } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { buildAuditSchema } from "../app/agents/audit-schema";
import { neon } from "@neondatabase/serverless";

export const auditStream = streams.define<string>({ id: "audit-stream" });

async function storeAuditReport(orgId: string, report: any) {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`DELETE FROM policy_check WHERE organization_id = ${orgId} AND rule_id = 'agent-audit'`;
  for (const [controlId, v] of Object.entries(report.controls ?? {})) {
    const status = v.status === "needs-human-input" ? "warning" : v.status;
    await sql`
      INSERT INTO policy_check (id, rule_id, organization_id, status, detail, needs_review, last_checked_at, created_at)
      VALUES (${`agent-${controlId}-${Date.now()}`}, 'agent-audit', ${orgId}, ${status}, ${v.detail + (v.suggestedAction ? ` ${v.suggestedAction}` : "")}, ${status === "warning" || v.status === "needs-human-input"}, NOW(), NOW())
    `;
  }
}

export const runAudit = task({
  id: "run-audit",
  run: async (
    payload: {
      orgId: string;
      controls: { controlId: string; category: string; title: string; description: string }[];
    },
    { signal },
  ) => {
    const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });
    const model = openrouter.chat("deepseek/deepseek-v4-flash", {
      temperature: 0,
      reasoning: { effort: "xhigh" },
    });

    const composio = new Composio({ provider: new VercelProvider(), apiKey: process.env.COMPOSIO_API_KEY! });
    const session = await composio.create(payload.orgId);
    const tools = await session.tools();

    const controlIds = payload.controls.map((c) => c.controlId);
    const AuditSchema = buildAuditSchema(controlIds);

    const allTools = {
      ...tools,
      submitAuditReport: dynamicTool({
        description: "Submit the complete SOC 2 + EU AI Act audit report.",
        inputSchema: AuditSchema,
        execute: async (report: unknown) => report,
      }),
    };

    const result = streamText({
      model,
      tools: allTools,
      abortSignal: signal,
      prompt: [
        `You are a compliance auditor. Run a full audit for ${payload.orgId}.`,
        "",
        "You have live Composio tools available for whatever apps were just connected.",
        "For each control, probe the relevant API and record pass/fail/warning with rationale.",
        'When you have checked all controls, call "submitAuditReport" with the complete report.',
        "Do NOT skip or summarize — every control must have a verdict.",
        "",
        "SOC 2 controls:",
        ...payload.controls.filter((c) => c.category !== "AI").map((c) => `${c.controlId} (${c.category}): ${c.title} — ${c.description}`),
        "",
        "EU AI Act controls:",
        ...payload.controls.filter((c) => c.category === "AI").map((c) => `${c.controlId}: ${c.title} — ${c.description}`),
      ].join("\n"),
    });

    let finalReport: unknown = null;

    for await (const part of result.fullStream) {
      if (part.type === "reasoning-delta") {
        await auditStream.append(JSON.stringify({ type: "reasoning", data: part.text }));
      } else if (part.type === "text-delta") {
        await auditStream.append(JSON.stringify({ type: "text", data: part.text }));
      } else if (part.type === "tool-call") {
        await auditStream.append(JSON.stringify({ type: "tool-call", tool: part.toolName, args: JSON.stringify(part.input).slice(0, 200) }));
      } else if (part.type === "tool-result" && part.toolName === "submitAuditReport") {
        finalReport = part.output;
      } else if (part.type === "error") {
        await auditStream.append(JSON.stringify({ type: "error", data: String(part.error) }));
      }
    }

    if (finalReport) {
      await storeAuditReport(payload.orgId, finalReport as any);
      return { stored: true };
    }

    return { stored: false };
  },
});
