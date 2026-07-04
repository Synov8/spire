import { useState, type ReactNode } from "react";
import { useLoaderData, Link } from "react-router";
import { db } from "~/db";
import { control, policyCheck } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { auth as triggerAuth, runs } from "@trigger.dev/sdk";
import { eq } from "drizzle-orm";
import { hasActiveSubscription } from "~/lib/subscription-check";
import type { Route } from "./+types/dashboard.index";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { controls: [], total: 0, verified: 0, failed: 0, warned: 0, unchecked: 0, orgId: "", hasAudit: false, controlStatus: {} as Record<string, string>, controlDetails: {} as Record<string, string>, activeRunId: null, summaryStats: null };
  const orgId = session.session.activeOrganizationId!;
  // if (!await hasActiveSubscription(orgId, session.user.id)) throw redirect("/dashboard/billing");
  const allControls = await db.select().from(control).where(eq(control.framework, "soc2"));
  const verdicts = await db.select().from(policyCheck).where(eq(policyCheck.organizationId, orgId));

  const verified = verdicts.filter((v) => v.status === "pass").length;
  const failed = verdicts.filter((v) => v.status === "fail").length;
  const warned = verdicts.filter((v) => v.status === "warning").length;
  const unchecked = allControls.length - verdicts.length;

  const pct = allControls.length > 0 ? Math.round((verified / allControls.length) * 100) : 0;
  const summaryStats = verdicts.length > 0 ? { pct, verified, failed, warned, unchecked, total: allControls.length } : null;

  // build a map of controlId → latest verdict status + detail
  // ruleId is the controlId directly
  const controlStatus: Record<string, string> = {};
  const controlDetails: Record<string, string> = {};
  for (const v of verdicts) {
    if (v.ruleId) {
      controlStatus[v.ruleId] = v.status;
      controlDetails[v.ruleId] = v.detail || "";
    }
  }

  // Check for active audit runs for this org
  let activeRunId: string | null = null;
  try {
    const recentRuns = await runs.list({
      taskIdentifier: "run-audit",
      tag: `org:${orgId}`,
      limit: 5,
    });
    const active = recentRuns.find((r: any) =>
      ["QUEUED", "EXECUTING", "WAITING"].includes(r.status)
    );
    if (active) {
      const token = await triggerAuth.createPublicToken({
        scopes: { read: { runs: [active.id] } },
      });
      activeRunId = `${active.id}:${token}`;
    }
  } catch {
    // runs.list not critical — just skip if it fails
  }

  return { controls: allControls, total: allControls.length, verified, failed, warned, unchecked, summaryStats, orgId, hasAudit: verdicts.length > 0, controlStatus, controlDetails, activeRunId };
}

export default function DashboardHome({ loaderData }: Route.ComponentProps) {
  const { controls, total, verified, failed, warned, unchecked, summaryStats, orgId, hasAudit, controlStatus, controlDetails, activeRunId } = loaderData;
  const [running, setRunning] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [expandedControl, setExpandedControl] = useState<string | null>(null);
  // NOTE: useNavigate causes full-page reloads in some React Router v7 configs,
  // so we use window.location.href for navigation instead.

  // Parse activeRunId (format: "runId:token")
  const activeRun = activeRunId ? { runId: activeRunId.split(":")[0], token: activeRunId.split(":")[1] } : null;

  const runAudit = async () => {
    setRunning(true);
    setAuditError(null);
    try {
      const res = await fetch(`/api/trigger-audit`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setAuditError(err.error || `HTTP ${res.status}`);
        setRunning(false);
        return;
      }
      const data = await res.json() as { runId: string; publicToken: string };
      window.location.href = `/dashboard/audit?runId=${data.runId}&token=${data.publicToken}`;
    } catch (e) {
      setAuditError(String(e));
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Overview</h1>
          <p className="mt-1 text-sm text-[#6A6D6E]">Monitor your compliance posture and audit readiness</p>
        </div>
        <div className="flex items-center gap-3">
          {hasAudit && (
            <a href="/dashboard/export" download
              className="rounded-lg border border-[#1A1D1E] px-4 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-all duration-200">
              Export report
            </a>
          )}
          {activeRun && (
            <Link to={`/dashboard/audit?runId=${activeRun.runId}&token=${activeRun.token}`}
              className="rounded-lg border border-[#00D4AA]/30 px-4 py-2 text-sm font-medium text-[#00D4AA] hover:bg-[#00D4AA]/10 transition-all duration-200">
              View current audit
            </Link>
          )}
          <button onClick={runAudit} disabled={running}
            className="rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">
            {running ? "Auditing…" : "Run AI audit"}
          </button>
        </div>
        {auditError && (
          <p className="mt-3 text-sm text-[#EF4444]">Failed to start audit: {auditError}</p>
        )}
      </div>

      {running && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07080A]/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-[#1A1D1E] bg-[#0B0D0E] p-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#00D4AA]" />
              <h2 className="text-sm font-semibold text-[#00D4AA]">Starting audit…</h2>
            </div>
          </div>
        </div>
      )}

      {!hasAudit && !summaryStats && (
        <div className="rounded-2xl border border-dashed border-[#1A1D1E] bg-[#0B0D0E]/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1A1D1E] bg-[#141718]">
            <svg className="h-6 w-6 text-[#4A4D4E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <p className="mt-4 text-sm font-medium text-[#8B8B93]">No audit run yet</p>
          <p className="mt-1 text-xs text-[#5C5C66]">Connect integrations, then run an audit.</p>
          <Link to="/dashboard/integrations" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v12M2 8h12"/></svg>
            Connect integrations
          </Link>
        </div>
      )}

      {summaryStats && (
        <div className="overflow-hidden rounded-2xl border border-[#1A1D1E] bg-[#0B0D0E]">
          <div className="flex items-center gap-2 border-b border-[#1A1D1E] bg-gradient-to-r from-[#00D4AA]/[0.05] to-transparent px-5 py-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#00D4AA]/15 text-[10px] font-bold text-[#00D4AA]">AI</span>
            <h2 className="text-sm font-semibold text-[#F1F1F3]">Compliance Summary</h2>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-[#6A6D6E]">
              <span className="text-2xl font-bold text-[#F1F1F3]">{summaryStats.pct}%</span>
              <span className="mx-2 text-[#5C5C66]">pass rate —</span>
              <span className="text-[#00D4AA]">{summaryStats.verified} passed</span>
              <span className="mx-1.5 text-[#5C5C66]">·</span>
              <span className="text-[#EF4444]">{summaryStats.failed} failed</span>
              <span className="mx-1.5 text-[#5C5C66]">·</span>
              <span className="text-[#F59E0B]">{summaryStats.warned} warnings</span>
              <span className="mx-1.5 text-[#5C5C66]">·</span>
              <span className="text-[#5C5C66]">{summaryStats.unchecked} unchecked</span>
              <span className="mx-1.5 text-[#5C5C66]">out of</span>
              <span className="text-[#F1F1F3]">{summaryStats.total} controls</span>
            </p>
          </div>
        </div>
      )}

      {hasAudit && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#5C5C66]">
              Controls ({verified + failed + warned} of {total} checked)
            </h2>
            <div className="flex items-center gap-4 text-xs text-[#5C5C66]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#00D4AA]" />Pass</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#EF4444]" />Fail</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#F59E0B]" />Warning</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#1A1D1E]" />Unchecked</span>
            </div>
          </div>
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[#1A1D1E]">
            <div className="flex h-full">
              <div className="bg-[#00D4AA] transition-all duration-500" style={{ width: `${total > 0 ? (verified / total) * 100 : 0}%` }} />
              <div className="bg-[#EF4444] transition-all duration-500" style={{ width: `${total > 0 ? (failed / total) * 100 : 0}%` }} />
              <div className="bg-[#F59E0B] transition-all duration-500" style={{ width: `${total > 0 ? (warned / total) * 100 : 0}%` }} />
            </div>
          </div>
              <div className="space-y-1">
            {controls.map((c) => {
              const status = controlStatus[c.controlId] || "unchecked";
              const isOpen = expandedControl === c.controlId;
              const detail = controlDetails[c.controlId];
              const dot =
                status === "pass" ? "bg-[#00D4AA]" :
                status === "fail" ? "bg-[#EF4444]" :
                status === "warning" ? "bg-[#F59E0B]" :
                "bg-[#1A1D1E]";
              return (
                <div key={c.id}>
                  <button
                    onClick={() => setExpandedControl(isOpen ? null : c.controlId)}
                    className={`flex w-full items-center gap-2 rounded-lg border ${isOpen ? "border-[#00D4AA]/30" : "border-[#1A1D1E]"} bg-[#0B0D0E]/50 px-3 py-2 text-xs transition-all hover:border-[#1C1C24] text-left`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                    <span className="font-mono text-[#5C5C66] w-16 shrink-0">{c.controlId}</span>
                    <span className="truncate text-[#8B8B93] flex-1">{c.title}</span>
                    <span className={`shrink-0 text-[10px] font-medium uppercase ${
                      status === "pass" ? "text-[#00D4AA]" :
                      status === "fail" ? "text-[#EF4444]" :
                      status === "warning" ? "text-[#F59E0B]" :
                      "text-[#5C5C66]"
                    }`}>{status}</span>
                  </button>
                  {isOpen && detail && (
                    <div className="mx-3 mb-1 mt-0.5 rounded-lg border border-[#1A1D1E] bg-[#07080A] px-3 py-2">
                      <p className="text-[11px] text-[#6A6D6E] leading-relaxed">{detail}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
function StatCard({ label, value, accent, icon }: { label: string; value: number; accent?: string | boolean; icon?: ReactNode }) {
  const color = accent === "red" ? "text-[#EF4444]" : accent === "muted" ? "text-[#5C5C66]" : accent ? "text-[#00D4AA]" : "text-[#F1F1F3]";
  const iconBg = accent === "red" ? "bg-[#EF4444]/10 text-[#EF4444]" : accent === "muted" ? "bg-[#1A1D1E] text-[#5C5C66]" : accent ? "bg-[#00D4AA]/10 text-[#00D4AA]" : "bg-[#1A1D1E] text-[#8B8B93]";
  return (
    <div className="rounded-2xl border border-[#1A1D1E] bg-[#0B0D0E] p-5 transition-all duration-200 hover:border-[#1C1C24]">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#5C5C66] uppercase tracking-wider">{label}</p>
        {icon && <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>{icon}</span>}
      </div>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
