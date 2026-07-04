export function meta() {
  return [{ title: "Integrations | Spire" }, { name: "description", content: "Connect your infrastructure for compliance monitoring" }];
}

import { useState } from "react";
import { useLoaderData } from "react-router";
import { DASHBOARD_INTEGRATIONS, INTEGRATION_CATEGORIES, type DashboardIntegration } from "~/lib/integration-data";
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
    // no session yet
  }
  return { connected: [...connected] };
}

const slugToCat = new Map<string, string>();
for (const cat of INTEGRATION_CATEGORIES) {
  for (const slug of cat.slugs) slugToCat.set(slug, cat.label);
}

function integrationCategory(app: string) {
  return slugToCat.get(app) ?? "Other";
}

function Card({ app, label, desc, initial, connected, loading, onConnect, onDisconnect }: {
  app: string; label: string; desc: string; initial: string;
  connected: boolean; loading: string | null; onConnect: (app: string) => void; onDisconnect?: (app: string) => void;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${connected ? "border-[#00D4AA]/20 bg-[#00D4AA]/[0.02]" : "border-[#1A1D1E] bg-[#0B0D0E]"}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${connected ? "border-[#00D4AA]/30 bg-[#00D4AA]/10 text-[#00D4AA]" : "border-[#1A1D1E] bg-[#141718] text-[#8B8B93]"}`}>
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-[#F1F1F3]">{label}</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-[#6A6D6E]">{desc}</p>
        </div>
      </div>
      {connected ? (
        <button type="button" onClick={() => onDisconnect?.(app)}
          className="group mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#00D4AA]/20 bg-[#00D4AA]/[0.04] py-2 text-sm text-[#00D4AA] hover:border-[#EF4444]/30 hover:bg-[#EF4444]/[0.04] hover:text-[#EF4444] transition-all duration-200">
          <svg className="h-4 w-4 group-hover:hidden" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3.5 8.5l3 3 6-7"/></svg>
          <svg className="hidden h-4 w-4 group-hover:block" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
          <span className="group-hover:hidden">Connected</span>
          <span className="hidden group-hover:inline">Disconnect</span>
        </button>
      ) : (
        <button type="button" onClick={() => onConnect(app)} disabled={loading === app}
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
}

export default function IntegrationsPage() {
  const { connected } = useLoaderData<typeof loader>();
  const connectedSet = new Set(connected);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const activeCategory = selectedCategory ?? "All";

  const inCategory = activeCategory === "All"
    ? DASHBOARD_INTEGRATIONS
    : DASHBOARD_INTEGRATIONS.filter((i) => integrationCategory(i.app) === activeCategory);
  const inCategoryConnected = inCategory.filter((i) => connectedSet.has(i.app));
  const inCategoryAvailable = inCategory.filter((i) => !connectedSet.has(i.app));

  const disconnect = async (app: string) => {
    if (!confirm(`Disconnect ${app}? This will remove all collected evidence from this integration.`)) return;
    setLoading(app);
    try {
      await fetch("/api/composio/connect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app }),
      });
      window.location.reload();
    } finally {
      setLoading(null);
    }
  };

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
    <div className="flex gap-8">
      {/* Category sidebar */}
      <nav className="w-44 shrink-0 space-y-1">
        <button type="button" onClick={() => setSelectedCategory(null)}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
            activeCategory === "All"
              ? "bg-[#00D4AA]/[0.08] text-[#E8E8E8]"
              : "text-[#6A6D6E] hover:bg-[#141718] hover:text-[#E8E8E8]"
          }`}>
          <span>All</span>
          {DASHBOARD_INTEGRATIONS.filter((i) => connectedSet.has(i.app)).length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00D4AA]/15 px-1.5 text-[10px] font-medium text-[#00D4AA]">
              {DASHBOARD_INTEGRATIONS.filter((i) => connectedSet.has(i.app)).length}
            </span>
          )}
        </button>
        <div className="border-t border-[#1A1D1E] pt-1">
          {INTEGRATION_CATEGORIES.map((cat) => {
            const inCat = DASHBOARD_INTEGRATIONS.filter((i) => integrationCategory(i.app) === cat.label);
            const catConnected = inCat.filter((i) => connectedSet.has(i.app)).length;
            return (
              <button key={cat.label} onClick={() => setSelectedCategory(cat.label)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeCategory === cat.label
                    ? "bg-[#00D4AA]/[0.08] text-[#E8E8E8]"
                    : "text-[#6A6D6E] hover:bg-[#141718] hover:text-[#E8E8E8]"
                }`}>
                <span>{cat.label}</span>
                {catConnected > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00D4AA]/15 px-1.5 text-[10px] font-medium text-[#00D4AA]">{catConnected}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Integration cards */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Integrations</h1>
          <p className="mt-1 text-sm text-[#6A6D6E]">Connect your infrastructure via read-only OAuth. No tokens to handle — we manage the broker.</p>
        </div>
        {error && <div className="mb-6 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/[0.06] px-4 py-3 text-sm text-[#EF4444]">{error}</div>}

        {activeCategory === "All" ? (
          <div className="space-y-8">
            {INTEGRATION_CATEGORIES.map((cat) => {
              const catItems = DASHBOARD_INTEGRATIONS.filter((i) => integrationCategory(i.app) === cat.label);
              const catConnected = catItems.filter((i) => connectedSet.has(i.app));
              const catAvailable = catItems.filter((i) => !connectedSet.has(i.app));
              if (catItems.length === 0) return null;
              return (
                <section key={cat.label}>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#5C5C66]">{cat.label}</h2>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {catConnected.map((i) => <Card key={i.app} {...i} connected={true} loading={loading} onConnect={connect} onDisconnect={disconnect} />)}
                    {catAvailable.map((i) => <Card key={i.app} {...i} connected={false} loading={loading} onConnect={connect} />)}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {inCategoryConnected.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#00D4AA]">Connected ({inCategoryConnected.length})</h2>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {inCategoryConnected.map((i) => <Card key={i.app} {...i} connected={true} loading={loading} onConnect={connect} onDisconnect={disconnect} />)}
                </div>
              </div>
            )}
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#5C5C66]">Available ({inCategoryAvailable.length})</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {inCategoryAvailable.map((i) => <Card key={i.app} {...i} connected={false} loading={loading} onConnect={connect} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
