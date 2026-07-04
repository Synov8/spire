import { task } from "@trigger.dev/sdk";
import { streamText, dynamicTool, stepCountIs } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { neon } from "@neondatabase/serverless";
import { auditStream, type AuditChunk } from "../app/lib/streams";
import { buildAuditSchema } from "../app/agents/audit-schema";

async function storeAuditReport(orgId: string, report: any) {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    if (!report || Object.keys(report).length === 0) {
      console.error("storeAuditReport: empty report", JSON.stringify(report).slice(0, 500));
      return;
    }
    const controlIds = Object.keys(report);
    // Remove stale policy checks and their orphaned manual evidence
    await sql`DELETE FROM manual_evidence WHERE policy_check_id IN (SELECT id FROM policy_check WHERE organization_id = ${orgId} AND (rule_id LIKE 'agent-audit%' OR rule_id = ANY(${controlIds})))`;
    await sql`DELETE FROM policy_check WHERE organization_id = ${orgId} AND (rule_id LIKE 'agent-audit%' OR rule_id = ANY(${controlIds}))`;
    for (const [controlId, v] of Object.entries(report)) {
      const entry = v as any;
      await sql`
        INSERT INTO policy_check (id, rule_id, organization_id, status, detail, last_checked_at, created_at)
        VALUES (gen_random_uuid(), ${controlId}, ${orgId}, ${entry.status}, ${entry.detail + (entry.suggestedAction ? ` ${entry.suggestedAction}` : "")}, NOW(), NOW())
      `;
    }
  } catch (err) {
    console.error("storeAuditReport failed", err);
    throw err;
  }
}



export const runAudit = task({
  id: "run-audit",
  run: async (payload: { orgId: string; controls: { controlId: string; category: string; title: string; description: string }[] }) => {
    const { orgId, controls } = payload;
    const controlIds = controls.map((c) => c.controlId);

    const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });
    const model = openrouter.chat("deepseek/deepseek-v4-flash", {
      temperature: 0,
      reasoning: { effort: "xhigh" },
    });

    const composio = new Composio({
      provider: new VercelProvider(),
      apiKey: process.env.COMPOSIO_API_KEY!,
    });
    const session = await composio.create(orgId);
    const tools = await session.tools();

    const AuditSchema = buildAuditSchema(controlIds);

    let toolIdCounter = 0;

    const allTools = {
      ...tools,
      submitAuditReport: dynamicTool({
        description: "Submit the complete SOC 2 + EU AI Act audit report.",
        inputSchema: AuditSchema,
        execute: async (report: unknown) => {
          await auditStream.append({ type: "report-submitted" });
          await storeAuditReport(orgId, report);
          return report;
        },
      }),
    };

    const result = streamText({
      model,
      tools: allTools,
      stopWhen: stepCountIs(200),
      prompt: [
        `You are a compliance auditor. Run a full SOC 2 + EU AI Act audit for organization ${orgId}.`,
        ``,
        `You have live Composio tools available for whatever apps were just connected (GitHub, Stripe, Notion, Cloudflare, etc.).`,
        `Do NOT use "search_tools" or "composio_search_tools" — all available tools are already provided to you directly.`,
        `Just start using the tools by name to probe each app for evidence.`,
        `Probe each tool's API to gather evidence for every control listed below.`,
        `For each control record pass/fail/warning with a detailed rationale and evidence sources.`,
        `If a control cannot be verified via available APIs, mark it "needs-human-input".`,
        `When you have checked ALL controls, call "submitAuditReport" with the complete report.`,
        `Do NOT skip or summarize — every single control must have a verdict.`,
        `Do NOT output anything after calling submitAuditReport — just call it and stop.`,
        ``,
        `SOC 2 controls:`,
        ...controls.filter((c) => c.category !== "AI").map((c) => `${c.controlId} (${c.category}): ${c.title} — ${c.description}`),
        ``,
        `EU AI Act controls:`,
        ...controls.filter((c) => c.category === "AI").map((c) => `${c.controlId}: ${c.title} — ${c.description}`),
      ].join("\n"),
    });

    for await (const part of result.fullStream) {
      const p = part as any;
      if (p.type === "tool-call") {
        if (p.toolName === "submitAuditReport") continue;

        await auditStream.append({
          type: "tool-call",
          id: ++toolIdCounter,
          toolName: p.toolName,
          args: (p.input ?? p.args ?? {}) as Record<string, unknown>,
        });
      } else if (p.type === "tool-result") {
        if (p.toolName === "submitAuditReport") continue;

        await auditStream.append({
          type: "tool-result",
          id: toolIdCounter,
          result: p.result,
        });
      } else if (p.type === "error") {
        await auditStream.append({ type: "tool-error", id: toolIdCounter, error: String(p.error) });
      }
    }

    return { success: true };
  },
});
