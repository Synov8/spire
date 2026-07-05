export function meta() {
  return [{ title: "Health | Spire" }, { name: "description", content: "System health check for Spire infrastructure dependencies" }];
}

import { useLoaderData } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { neon } from "@neondatabase/serverless";
import { Composio } from "@composio/core";

async function check(label: string, fn: () => Promise<unknown>): Promise<{ label: string; ok: boolean; detail: string }> {
  const start = Date.now();
  try {
    await fn();
    return { label, ok: true, detail: `${Date.now() - start}ms` };
  } catch {
    return { label, ok: false, detail: "unreachable" };
  }
}

export async function loader() {
  const results = await Promise.all([
    check("Database", async () => {
      const sql = neon(process.env.DATABASE_URL!);
      const r = await sql`SELECT 1 AS ok`;
      if (!r?.[0]?.ok) throw new Error("query returned no rows");
    }),

    check("Payments", async () => {
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
    }),

    check("Email", async () => {
      if (!process.env.RESEND_API_KEY) throw new Error("missing key");
      const r = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    }),

    check("AI provider", async () => {
      if (!process.env.OPENROUTER_API_KEY) throw new Error("missing key");
      const r = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    }),

    check("Integrations", async () => {
      if (!process.env.COMPOSIO_API_KEY) throw new Error("missing key");
      const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY! });
      const list = await composio.connectedAccounts.list({ statuses: ["ACTIVE"] });
      const items = (list as { items?: unknown }).items ?? [];
      if (!Array.isArray(items)) throw new Error("unexpected response");
    }),

    check("Background jobs", async () => {
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
    }),
  ]);

  return { results, healthy: results.every(r => r.ok), ts: new Date().toISOString() };
}

function StatusIcon({ ok }: { ok: boolean }) {
  return ok
    ? <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#00D4AA]" />
    : <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#FF4D4D]" />;
}

export default function HealthPage() {
  const { results, healthy, ts } = useLoaderData<typeof loader>();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Spire Health Check",
    description: "Live status of Spire's infrastructure dependencies",
    about: {
      "@type": "SoftwareApplication",
      name: "Spire",
      applicationCategory: "Compliance Automation",
    },
    dateModified: ts,
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mx-auto max-w-2xl px-6 pt-20 pb-24">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">System</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">Health check</h1>
          <div className="mt-4 flex items-center justify-center gap-2">
            <StatusIcon ok={healthy} />
            <span className={healthy ? "text-[#00D4AA]" : "text-[#FF4D4D]"}>
              {healthy ? "All systems operational" : "Some checks failed"}
            </span>
            <span className="text-xs text-[#5C5C66]">| {new Date(ts).toLocaleString("en-GB")}</span>
          </div>
        </div>

        <div className="mt-10 space-y-2">
          {results.map((r: any) => (
            <div key={r.label} className="flex items-center justify-between rounded-lg border border-[#1C1C24] bg-[#111116] px-5 py-3">
              <div className="flex items-center gap-3">
                <StatusIcon ok={r.ok} />
                <span className="text-sm text-[#F1F1F3]">{r.label}</span>
              </div>
              <span className={`text-xs ${r.ok ? "text-[#5C5C66]" : "text-[#FF4D4D]"}`}>{r.detail}</span>
            </div>
          ))}
        </div>


      </section>
    </PublicLayout>
  );
}
