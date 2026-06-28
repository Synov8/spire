import { useState } from "react";
import { useLoaderData, Link, redirect } from "react-router";
import { db } from "~/db";
import { control, policyCheck } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { eq } from "drizzle-orm";
import { hasActiveSubscription } from "~/lib/subscription-check";
import type { Route } from "./+types/dashboard.index";
import { generateComplianceSummary } from "~/lib/ai";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { controls: [], total: 0, verified: 0, failed: 0, warned: 0, unchecked: 0, summary: null, orgId: "", hasAudit: false };
  const orgId = session.session.activeOrganizationId!;
  if (!await hasActiveSubscription(orgId, session.user.id)) throw redirect("/dashboard/billing");
  const allControls = await db.select().from(control).where(eq(control.framework, "soc2"));
  const verdicts = await db.select().from(policyCheck).where(eq(policyCheck.organizationId, orgId));

  const verified = verdicts.filter((v) => v.status === "pass").length;
  const failed = verdicts.filter((v) => v.status === "fail").length;
  const warned = verdicts.filter((v) => v.status === "warning").length;
  const unchecked = allControls.length - verdicts.length;

  let summary = null;
  try {
    const evidenceDetail = verdicts.length > 0
      ? `${verdicts.length} controls checked (${verified} pass, ${failed} fail, ${warned} warnings)`
      : "No audit run yet";
    summary = await generateComplianceSummary(
      { name: session.user.name, industry: "tech" },
      { totalControls: allControls.length, satisfied: verified, partial: warned, missing: unchecked, integrations: 0 },
      evidenceDetail,
    );
  } catch {}

  return { controls: allControls, total: allControls.length, verified, failed, warned, unchecked, summary, orgId, hasAudit: verdicts.length > 0 };
}

export default function DashboardHome({ loaderData }: Route.ComponentProps) {
  const { controls, total, verified, failed, warned, unchecked, summary, orgId, hasAudit } = loaderData;
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const runAudit = async () => {
    setRunning(true);
    setLogs([]);
    try {
      const res = await fetch(`/api/audit/stream?orgId=${encodeURIComponent(orgId!)}`);
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).trim().split("\n");
        for (const line of lines) {
          try {
            const msg = JSON.parse(line);
            if (msg.type === "text") setLogs((prev) => [...prev, msg.data]);
            if (msg.type === "done") { window.location.reload(); return; }
          } catch {}
        }
      }
    } catch {}
    setRunning(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Overview</h1>
        <button onClick={runAudit} disabled={running}
          className="rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-colors disabled:opacity-50">
          {running ? "Auditing..." : "Run AI audit"}
        </button>
        <a href="/dashboard/export" download
          className="rounded-lg border border-[#1C1C24] px-4 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors">
          Export report
        </a>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="SOC 2 Controls" value={total} />
        <StatCard label="Verified" value={verified} accent />
        <StatCard label="Failed" value={failed} accent="red" />
        <StatCard label="Unchecked" value={unchecked} accent="muted" />
      </div>

      {running && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0C]/80">
          <div className="w-full max-w-2xl rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
            <h2 className="text-sm font-semibold text-[#00D4AA]">AI Audit in progress</h2>
            <div className="mt-4 h-64 overflow-y-auto rounded-lg bg-[#0A0A0C] p-3 font-mono text-xs leading-relaxed text-[#8B8B93]">
              {logs.length === 0 && <span className="animate-pulse text-[#5C5C66]">Initializing audit...</span>}
              {logs.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
        </div>
      )}

      {!hasAudit && !summary && (
        <div className="rounded-xl border border-dashed border-[#1C1C24] p-8 text-center">
          <p className="text-sm text-[#5C5C66]">No audit run yet.</p>
          <p className="mt-1 text-xs text-[#5C5C66]">Connect integrations via Composio, then run an audit.</p>
          <Link to="/dashboard/integrations" className="mt-4 inline-block rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-colors">
            Connect integrations
          </Link>
        </div>
      )}

      {summary && (
        <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-[#00D4AA]/10 text-[10px] font-bold text-[#00D4AA]">AI</span>
            <h2 className="text-sm font-semibold text-[#F1F1F3]">Compliance Summary</h2>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#8B8B93]">{summary}</p>
        </div>
      )}

      {hasAudit && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#5C5C66]">
              Controls ({verified + failed + warned} of {total} checked)
            </h2>
          </div>
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[#1C1C24]">
            <div className="flex h-full">
              <div className="bg-[#00D4AA] transition-all" style={{ width: `${total > 0 ? (verified / total) * 100 : 0}%` }} />
              <div className="bg-[#EF4444] transition-all" style={{ width: `${total > 0 ? (failed / total) * 100 : 0}%` }} />
              <div className="bg-[#F59E0B] transition-all" style={{ width: `${total > 0 ? (warned / total) * 100 : 0}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {controls.slice(0, 12).map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-lg border border-[#1C1C24] bg-[#111116]/50 px-2.5 py-1.5 text-xs">
                <span className="font-mono text-[#5C5C66]">{c.controlId}</span>
                <span className="truncate text-[#8B8B93]">{c.title}</span>
              </div>
            ))}
            {controls.length > 12 && <div className="col-span-3 text-center text-xs text-[#5C5C66]">+{controls.length - 12} more controls</div>}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string | boolean }) {
  const color = accent === "red" ? "text-[#EF4444]" : accent === "muted" ? "text-[#5C5C66]" : accent ? "text-[#00D4AA]" : "text-[#F1F1F3]";
  return (
    <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-4">
      <p className="text-xs text-[#5C5C66] uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
