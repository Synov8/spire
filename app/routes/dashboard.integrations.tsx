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
    <div className={`rounded-xl border p-5 ${connected ? "border-brand/20 bg-brand/[0.02]" : "border-border-primary bg-surface-secondary"}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${connected ? "border-brand/30 bg-brand/10 text-brand" : "border-border-primary bg-surface-tertiary text-text-secondary"}`}>
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-text-primary">{label}</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-text-tertiary">{desc}</p>
        </div>
      </div>
      {connected ? (
        <button type="button" onClick={() => onDisconnect?.(app)}
          className="group mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] border border-brand/20 bg-brand/[0.04] py-2 text-sm text-brand hover:border-error/30 hover:bg-error/[0.04] hover:text-error transition-all duration-200">
          <svg className="h-4 w-4 group-hover:hidden" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3.5 8.5l3 3 6-7"/></svg>
          <svg className="hidden h-4 w-4 group-hover:block" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
          <span className="group-hover:hidden">Connected</span>
          <span className="hidden group-hover:inline">Disconnect</span>
        </button>
      ) : (
        <button type="button" onClick={() => onConnect(app)} disabled={loading === app}
          className="mt-4 w-full rounded-[20px] border border-border-primary bg-surface-tertiary py-2 text-sm font-medium text-text-secondary hover:border-brand/40 hover:text-brand transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading === app ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-border-primary border-t-brand" />
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
              ? "bg-brand/[0.08] text-text-primary"
              : "text-text-tertiary hover:bg-surface-tertiary hover:text-text-primary"
          }`}>
          <span>All</span>
          {DASHBOARD_INTEGRATIONS.filter((i) => connectedSet.has(i.app)).length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand/15 px-1.5 text-[10px] font-medium text-brand">
              {DASHBOARD_INTEGRATIONS.filter((i) => connectedSet.has(i.app)).length}
            </span>
          )}
        </button>
        <div className="border-t border-border-primary pt-1">
          {INTEGRATION_CATEGORIES.map((cat) => {
            const inCat = DASHBOARD_INTEGRATIONS.filter((i) => integrationCategory(i.app) === cat.label);
            const catConnected = inCat.filter((i) => connectedSet.has(i.app)).length;
            return (
              <button key={cat.label} onClick={() => setSelectedCategory(cat.label)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeCategory === cat.label
                    ? "bg-brand/[0.08] text-text-primary"
                    : "text-text-tertiary hover:bg-surface-tertiary hover:text-text-primary"
                }`}>
                <span>{cat.label}</span>
                {catConnected > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand/15 px-1.5 text-[10px] font-medium text-brand">{catConnected}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Integration cards */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Integrations</h1>
          <p className="mt-1 text-sm text-text-tertiary">Connect your infrastructure via read-only OAuth. No tokens to handle - we manage the broker.</p>
        </div>
        {error && <div className="mb-6 rounded-xl border border-error/20 bg-error/[0.06] px-4 py-3 text-sm text-error">{error}</div>}

        {activeCategory === "All" ? (
          <div className="space-y-8">
            {INTEGRATION_CATEGORIES.map((cat) => {
              const catItems = DASHBOARD_INTEGRATIONS.filter((i) => integrationCategory(i.app) === cat.label);
              const catConnected = catItems.filter((i) => connectedSet.has(i.app));
              const catAvailable = catItems.filter((i) => !connectedSet.has(i.app));
              if (catItems.length === 0) return null;
              return (
                <section key={cat.label}>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">{cat.label}</h2>
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
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand">Connected ({inCategoryConnected.length})</h2>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {inCategoryConnected.map((i) => <Card key={i.app} {...i} connected={true} loading={loading} onConnect={connect} onDisconnect={disconnect} />)}
                </div>
              </div>
            )}
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">Available ({inCategoryAvailable.length})</h2>
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
