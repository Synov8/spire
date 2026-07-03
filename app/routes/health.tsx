import { useLoaderData } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { neon } from "@neondatabase/serverless";

async function check(label: string, fn: () => Promise<unknown>): Promise<{ label: string; ok: boolean; detail: string }> {
  const start = Date.now();
  try {
    await fn();
    return { label, ok: true, detail: `${Date.now() - start}ms` };
  } catch (e: any) {
    return { label, ok: false, detail: String(e.message ?? e).slice(0, 120) };
  }
}

export async function loader() {
  const results = await Promise.all([
    check("Database (Neon)", async () => {
      const sql = neon(process.env.DATABASE_URL!);
      const r = await sql`SELECT 1 AS ok`;
      if (!r?.[0]?.ok) throw new Error("query returned no rows");
    }),

    check("Stripe API", async () => {
      if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith("sk_test")) throw new Error("Using test key or missing");
      const r = await fetch("https://api.stripe.com/v1/balance", {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      const b = await r.json() as any;
      if (!b.available) throw new Error("no balance data");
    }),

    check("Resend API", async () => {
      if (!process.env.RESEND_API_KEY) throw new Error("missing key");
      const r = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    }),

    check("OpenRouter API", async () => {
      if (!process.env.OPENROUTER_API_KEY) throw new Error("missing key");
      const r = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    }),

    check("Composio API", async () => {
      if (!process.env.COMPOSIO_API_KEY) throw new Error("missing key");
      const r = await fetch("https://backend.composio.dev/api/v1/connectedAccounts", {
        headers: { Authorization: `Bearer ${process.env.COMPOSIO_API_KEY}` },
      });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    }),

    check("Better Auth config", async () => {
      if (!process.env.BETTER_AUTH_SECRET) throw new Error("missing BETTER_AUTH_SECRET");
      if (!process.env.BETTER_AUTH_URL) throw new Error("missing BETTER_AUTH_URL");
    }),

    check("Cloudflare platform", async () => {
      // being served by CF means the platform is up
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

  return (
    <PublicLayout>
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

        <div className="mt-8 rounded-xl border border-[#1C1C24] bg-[#111116] p-5">
          <p className="text-xs text-[#5C5C66]">
            This page checks connectivity to each service Spire depends on. If a check fails,
            verify the corresponding API key is set in your Cloudflare Worker secrets and is valid.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
