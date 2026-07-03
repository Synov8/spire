import { useState } from "react";
import { useLoaderData } from "react-router";
import { DASHBOARD_INTEGRATIONS } from "~/lib/integration-data";
import { auth } from "~/lib/auth.server";
import { db } from "~/db";
import { organization } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import type { Route } from "./+types/dashboard.integrations";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { connected: [] };
  const orgId = session.session.activeOrganizationId!;

  const connected = new Set<string>();
  try {
    const composio = new Composio({ provider: new VercelProvider(), apiKey: process.env.COMPOSIO_API_KEY || "" });
    const list = await composio.connectedAccounts.list({ userIds: [orgId], statuses: ["ACTIVE"] });
    const items = (list as { items?: Array<Record<string, unknown>> }).items ?? [];
    for (const a of items) {
      const slug = ((a.toolkit as { slug?: string } | undefined)?.slug ?? "").toLowerCase();
      if (slug) connected.add(slug);
    }
  } catch {
    // no session yet — all show Connect
  }

  return { connected: [...connected] };
}

export default function IntegrationsPage() {
  const { connected } = useLoaderData<typeof loader>();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const connect = async (app: string) => {
    setLoading(app);
    setError("");
    try {
      const res = await fetch("/api/composio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setError(err.error || "Failed to connect");
        return;
      }
      const data = await res.json() as { redirectUrl?: string };
      if (data.redirectUrl) window.location.href = data.redirectUrl;
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Integrations</h1>
        <p className="mt-1 text-sm text-[#6A6D6E]">Connect your infrastructure via read-only OAuth. No tokens to handle — we manage the broker.</p>
      </div>
      {error && <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/[0.06] px-4 py-3 text-sm text-[#EF4444]">{error}</div>}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {DASHBOARD_INTEGRATIONS.map(({ app, label, desc, initial }) => {
          const isConnected = connected.includes(app);
          return (
            <div key={app}
              className={`group rounded-2xl border p-5 transition-all duration-200 ${
                isConnected
                  ? "border-[#00D4AA]/20 bg-[#00D4AA]/[0.02]"
                  : "border-[#1A1D1E] bg-[#0B0D0E] hover:border-[#00D4AA]/30 hover:bg-[#0B0D0E]"
              }`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition-colors ${
                  isConnected
                    ? "border-[#00D4AA]/30 bg-[#00D4AA]/10 text-[#00D4AA]"
                    : "border-[#1A1D1E] bg-[#141718] text-[#8B8B93] group-hover:border-[#00D4AA]/20 group-hover:text-[#00D4AA]"
                }`}>
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-[#F1F1F3]">{label}</h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#6A6D6E]">{desc}</p>
                </div>
              </div>
              {isConnected ? (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[#00D4AA]/20 bg-[#00D4AA]/[0.04] py-2 text-sm text-[#00D4AA]">
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3.5 8.5l3 3 6-7"/></svg>
                  Connected
                </div>
              ) : (
                <button onClick={() => connect(app)} disabled={loading === app}
                  className="mt-4 w-full rounded-lg border border-[#1A1D1E] bg-[#141718] py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA]/40 hover:text-[#00D4AA] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading === app ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#1A1D1E] border-t-[#00D4AA]" />
                      Connecting…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2v6M5 5l3-3 3 3M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2"/></svg>
                      Connect
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
