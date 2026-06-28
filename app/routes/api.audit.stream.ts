import { streamText, stepCountIs, Output } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { db } from "~/db";
import { control, organization } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { storeAuditReport, AuditReportSchema } from "~/agents/compliance-agent";
import { auth } from "~/lib/auth.server";
import { hasActiveSubscription } from "~/lib/subscription-check";
import type { LoaderFunctionArgs } from "react-router";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY || "" });
const model = openrouter.chat("deepseek/deepseek-v4-flash", { temperature: 0, reasoning: { effort: "xhigh" } });

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const orgId = url.searchParams.get("orgId");
  if (!orgId) return new Response("Missing orgId", { status: 400 });

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  if (!await hasActiveSubscription(orgId, session.user.id)) return new Response("Subscription required", { status: 402 });

  const composio = new Composio({ provider: new VercelProvider(), apiKey: process.env.COMPOSIO_API_KEY || "" });
  const org = await db.select().from(organization).where(eq(organization.id, orgId)).limit(1).then((r) => r[0]);
  const existingSessionId = (org?.metadata as Record<string, unknown> | null)?.composioSessionId as string | undefined;

  let composioSession;
  if (existingSessionId) { try { composioSession = await composio.use(existingSessionId); } catch { composioSession = await composio.create(orgId); } }
  else { composioSession = await composio.create(orgId); }

  await db.update(organization).set({ metadata: { ...(org?.metadata as Record<string, unknown> || {}), composioSessionId: composioSession.sessionId } }).where(eq(organization.id, orgId));

  const tools = await composioSession.tools();
  const controlsList = await db.select().from(control).where(eq(control.framework, "soc2"));

  const result = streamText({
    model, tools,
    output: Output.object({ schema: AuditReportSchema, name: "AuditReport" }),
    stopWhen: stepCountIs(50),
    prompt: `You are a compliance auditor. Run a full audit for ${orgId}.

SOC 2 controls:
${controlsList.filter((c) => c.framework === "soc2").map((c) => `${c.controlId} (${c.category}): ${c.title} — ${c.description}`).join("\n")}

AI Act controls:
${controlsList.filter((c) => c.framework === "ai-act").map((c) => `${c.controlId}: ${c.title} — ${c.description}`).join("\n")}

For each control, probe the relevant API and record pass/fail/warning. Controls needing documentation should be listed as gaps.`,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.textStream) {
        controller.enqueue(encoder.encode(JSON.stringify({ type: "text", data: chunk }) + "\n"));
      }
      controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
      controller.close();

      try {
        const final = await result;
        if (final.output) await storeAuditReport(orgId, final.output as any);
      } catch (e) {
        console.error("Failed to store audit report:", e);
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache" },
  });
}
