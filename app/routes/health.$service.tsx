import { neon } from "@neondatabase/serverless";
import { Composio } from "@composio/core";

async function run(label: string, fn: () => Promise<unknown>): Promise<{ label: string; ok: boolean; detail: string }> {
  const start = Date.now();
  try {
    await fn();
    return { label, ok: true, detail: `${Date.now() - start}ms` };
  } catch (e) {
    return { label, ok: false, detail: e instanceof Error ? e.message : "unreachable" };
  }
}

const checks: Record<string, () => Promise<unknown>> = {
  database: async () => {
    const sql = neon(process.env.DATABASE_URL!);
    const r = await sql`SELECT 1 AS ok`;
    if (!r?.[0]?.ok) throw new Error("query returned no rows");
  },
  payments: async () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("missing key");
    const priceIds = ["STARTER", "STARTER_ANNUAL", "GROWTH", "GROWTH_ANNUAL", "ENTERPRISE", "ENTERPRISE_ANNUAL"]
      .map((k) => process.env[`STRIPE_${k}_PRICE_ID`])
      .filter(Boolean) as string[];
    if (priceIds.length === 0) throw new Error("no price IDs configured");
    for (const priceId of priceIds) {
      const r = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!r.ok) throw new Error(`price ${priceId}: ${r.status}`);
    }
  },
  email: async () => {
    if (!process.env.RESEND_API_KEY) throw new Error("missing key");
    const r = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  },
  "ai-provider": async () => {
    if (!process.env.OPENROUTER_API_KEY) throw new Error("missing key");
    const r = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
    });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  },
  integrations: async () => {
    if (!process.env.COMPOSIO_API_KEY) throw new Error("missing key");
    const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY! });
    const list = await composio.connectedAccounts.list({ statuses: ["ACTIVE"] });
    const items = (list as { items?: unknown }).items ?? [];
    if (!Array.isArray(items)) throw new Error("unexpected response");
  },
  "background-jobs": async () => {
    const { tasks, runs } = await import("@trigger.dev/sdk");
    const nonce = crypto.randomUUID();
    const handle = await tasks.trigger("health-check", { nonce }, { tags: ["health-check"] });
    for await (const run of runs.subscribeToRun(handle.id)) {
      if (run.isCompleted) {
        const output = run as any;
        if (output?.output?.nonce === nonce) return;
        throw new Error("output mismatch");
      }
      if (run.isFailed || run.isCancelled) throw new Error("run failed");
    }
  },
};

export async function loader({ params }: { params: { service: string } }) {
  const fn = checks[params.service];
  if (!fn) {
    return new Response(JSON.stringify({ error: `unknown service: ${params.service}` }, null, 2), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const result = await run(params.service, fn);
  return new Response(JSON.stringify({
    ...result,
    ts: new Date().toISOString(),
  }, null, 2), {
    status: result.ok ? 200 : 503,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
