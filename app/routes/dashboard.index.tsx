import { useState } from "react";
import { useLoaderData, Link } from "react-router";
import { db } from "~/db";
import { control, policyCheck } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { auth as triggerAuth, runs } from "@trigger.dev/sdk";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/dashboard.index";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { summaryStats: null, orgId: "", hasAudit: false, activeRunId: null };
  const orgId = session.session.activeOrganizationId!;
  const allControls = await db.select().from(control);
  const verdicts = await db.select().from(policyCheck).where(eq(policyCheck.organizationId, orgId));

  const verified = verdicts.filter((v) => v.status === "pass").length;
  const failed = verdicts.filter((v) => v.status === "fail").length;
  const warned = verdicts.filter((v) => v.status === "warning").length;
  const unchecked = allControls.length - verdicts.length;
  const pct = allControls.length > 0 ? Math.round((verified / allControls.length) * 100) : 0;
  const summaryStats = verdicts.length > 0 ? { pct, verified, failed, warned, unchecked, total: allControls.length } : null;

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
  } catch { /* skip */ }

  return { summaryStats, orgId, hasAudit: verdicts.length > 0, activeRunId };
}

export default function DashboardHome({ loaderData }: Route.ComponentProps) {
  const { summaryStats, orgId, hasAudit, activeRunId } = loaderData;
  const [running, setRunning] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [confirmAudit, setConfirmAudit] = useState(false);
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
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Overview</h1>
          <p className="mt-1 text-sm text-[#6A6D6E]">Monitor your compliance posture and audit readiness</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {summaryStats && <DonutSummary stats={summaryStats} />}
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
            <button onClick={() => setConfirmAudit(true)} disabled={running}
              className="rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_12px_-2px rgba(0,212,170,0.3)]">
              {running ? "Auditing…" : "New audit"}
            </button>
          </div>
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

      {confirmAudit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07080A]/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#1A1D1E] bg-[#0B0D0E] p-6 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5)]">
            <h3 className="text-sm font-semibold text-[#F1F1F3]">Run a new audit?</h3>
            <p className="mt-2 text-xs text-[#6A6D6E] leading-relaxed">
              This will clear all current review items and uploaded evidence files.
              The AI will re-check every control from scratch.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button onClick={() => setConfirmAudit(false)}
                className="rounded-lg border border-[#1A1D1E] px-4 py-2 text-xs font-medium text-[#8B8B93] hover:bg-[#141718] transition-all">
                Cancel
              </button>
              <button onClick={() => { setConfirmAudit(false); runAudit(); }}
                className="rounded-lg bg-[#00D4AA] px-4 py-2 text-xs font-medium text-black hover:bg-[#00B894] transition-all">
                Run audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function DonutSummary({ stats }: { stats: { pct: number; verified: number; failed: number; warned: number; unchecked: number; total: number } }) {
  const [hovered, setHovered] = useState<{ key: string; label: string; value: number; total: number } | null>(null);
  const cx = 50, cy = 50, r = 36, sw = 8;
  const circ = 2 * Math.PI * r;

  type Seg = { key: string; value: number; color: string; label: string };
  const segs: Seg[] = [
    { key: "pass", value: stats.verified, color: "#00D4AA", label: "Passed" },
    { key: "fail", value: stats.failed, color: "#EF4444", label: "Failed" },
    { key: "warning", value: stats.warned, color: "#F59E0B", label: "Warnings" },
    { key: "unchecked", value: stats.unchecked, color: "#1A1D1E", label: "Unchecked" },
  ];

  let offset = 0;
  const arcs = segs
    .filter((s) => s.value > 0)
    .map((s) => {
      const len = (s.value / stats.total) * circ;
      const a = { ...s, dash: `${len} ${circ - len}`, off: -offset };
      offset += len;
      return a;
    });

  return (
    <div className="relative shrink-0">
      <svg viewBox="6 6 88 88" className="h-28 w-28">
        {arcs.map((a) => (
          <circle
            key={a.key}
            cx={cx} cy={cy} r={r} fill="none"
            stroke={a.color} strokeWidth={sw}
            strokeDasharray={a.dash} strokeDashoffset={a.off}
            transform={`rotate(-90 ${cx} ${cy})`}
            className="cursor-pointer transition-opacity hover:opacity-80"
            onMouseEnter={() => setHovered({ key: a.key, label: a.label, value: a.value, total: stats.total })}
            onMouseLeave={() => setHovered(null)}
            style={{ outline: "none" }}
          />
        ))}
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-[#F1F1F3]" style={{ fontSize: 20, fontWeight: 700 }}>{stats.pct}%</text>
          <text x={cx} y={cy + 15} textAnchor="middle" dominantBaseline="central" className="fill-[#8B8B93]" style={{ fontSize: 7 }}>pass rate</text>
      </svg>
      {hovered && (
        <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 rounded-lg border border-[#2A2D2E] bg-[#1A1D1E] px-2.5 py-1.5 text-xs font-medium text-[#E8E8E8] whitespace-nowrap shadow-lg">
          {hovered.label}: {hovered.value}/{hovered.total}
        </div>
      )}
    </div>
  );
}
