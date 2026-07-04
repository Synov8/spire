import { useState, useEffect, useMemo } from "react";
import { animate } from "motion";
import { useLoaderData, Link } from "react-router";
import { db } from "~/db";
import { control, policyCheck, organization } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { auth as triggerAuth, runs } from "@trigger.dev/sdk";
import { eq } from "drizzle-orm";
import { DownloadReportButton } from "~/pdf-download.client";
import type { Route } from "./+types/dashboard.index";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { summaryStats: null, orgId: "", hasAudit: false, activeRunId: null, reportData: null };
  const orgId = session.session.activeOrganizationId!;
  const allControls = await db.select().from(control);
  const verdicts = await db.select().from(policyCheck).where(eq(policyCheck.organizationId, orgId));

  const verified = verdicts.filter((v) => v.status === "pass").length;
  const failed = verdicts.filter((v) => v.status === "fail").length;
  const warned = verdicts.filter((v) => v.status === "warning").length;
  const unchecked = allControls.length - verdicts.length;
  const pct = allControls.length > 0 ? Math.round((verified / allControls.length) * 100) : 0;
  const summaryStats = verdicts.length > 0 ? { pct, verified, failed, warned, unchecked, total: allControls.length } : null;

  const verdictByControl = new Map<string, typeof verdicts[0]>();
  for (const v of verdicts) if (v.ruleId) verdictByControl.set(v.ruleId, v);

  const frameworks = [...new Set(allControls.map((c) => c.framework))];
  const org = await db.select().from(organization).where(eq(organization.id, orgId)).limit(1).then((r) => r[0]);
  const appUrl = new URL(request.url).origin;
  const reportData = verdicts.length > 0 ? {
    appUrl,
    orgName: org?.name || session.user.name,
    date: new Date().toISOString().split("T")[0],
    frameworks: frameworks.map((fw) => ({
      framework: fw,
      controls: allControls.filter((c) => c.framework === fw).map((c) => {
        const v = verdictByControl.get(c.controlId);
        return { controlId: c.controlId, title: c.title, status: v?.status || "unchecked", detail: v?.detail || null };
      }),
    })),
  } : null;

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

  return { summaryStats, orgId, hasAudit: verdicts.length > 0, activeRunId, reportData };
}

export default function DashboardHome({ loaderData }: Route.ComponentProps) {
  const { summaryStats, orgId, hasAudit, activeRunId, reportData } = loaderData;
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
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Overview</h1>
        <p className="mt-1 text-sm text-[#6A6D6E]">Compliance posture and audit readiness</p>
      </div>

      {!hasAudit && !summaryStats && (
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-dashed border-[#1A1D1E] bg-[#0B0D0E]/50">
            <svg className="h-10 w-10 text-[#4A4D4E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <p className="text-sm font-medium text-[#8B8B93]">No audit run yet</p>
          <p className="text-xs text-[#5C5C66]">Connect integrations, then run an audit.</p>
          <Link to="/dashboard/integrations" className="inline-flex items-center gap-2 rounded-lg bg-[#00D4AA] px-5 py-2.5 text-sm font-medium text-black hover:bg-[#00B894] transition-all shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v12M2 8h12"/></svg>
            Connect integrations
          </Link>
        </div>
      )}

      {summaryStats && (
        <div className="flex flex-col items-center gap-6">
          <DonutSummary stats={summaryStats} />
          <div className="flex items-center gap-3">
            <Link to="/dashboard/review"
              className="rounded-lg bg-[#00D4AA] px-5 py-2.5 text-sm font-medium text-black hover:bg-[#00B894] transition-all shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">
              Review findings
            </Link>
            {activeRun && (
              <Link to={`/dashboard/audit?runId=${activeRun.runId}&token=${activeRun.token}`}
                className="rounded-lg border border-[#1A1D1E] px-5 py-2.5 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-all">
                View current audit
              </Link>
            )}
            <button onClick={() => setConfirmAudit(true)} disabled={running}
              className="rounded-lg border border-[#1A1D1E] px-5 py-2.5 text-sm font-medium text-[#8B8B93] hover:border-[#EF4444] hover:text-[#EF4444] transition-all disabled:opacity-50">
              {running ? "Auditing…" : "New audit"}
            </button>
            {DownloadReportButton && reportData && <DownloadReportButton
              appUrl={reportData.appUrl} orgName={reportData.orgName} date={reportData.date} frameworks={reportData.frameworks}
              className="rounded-lg border border-[#1A1D1E] px-5 py-2.5 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-all"
            />}
          </div>
          {auditError && (
            <p className="text-sm text-[#EF4444]">Failed to start audit: {auditError}</p>
          )}
        </div>
      )}

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
  const cx = 50, cy = 50, r = 36, sw = 10;
  const circ = 2 * Math.PI * r;

  type Seg = { key: string; value: number; color: string; label: string };
  const segs: Seg[] = [
    { key: "pass", value: stats.verified, color: "#00D4AA", label: "Passed" },
    { key: "fail", value: stats.failed, color: "#EF4444", label: "Failed" },
    { key: "warning", value: stats.warned, color: "#F59E0B", label: "Warnings" },
    { key: "unchecked", value: stats.unchecked, color: "#1A1D1E", label: "Unchecked" },
  ];

  const arcs = useMemo(() => {
    let offset = 0;
    return segs
      .filter((s) => s.value > 0)
      .map((s) => {
        const len = (s.value / stats.total) * circ;
        const a = { ...s, dash: `${len} ${circ - len}`, off: -offset, len };
        offset += len;
        return a;
      });
  }, [stats.verified, stats.failed, stats.warned, stats.unchecked, stats.total, circ]);

  useEffect(() => {
    const anims = arcs.map((a) => {
      const el = document.getElementById(`arc-${a.key}`);
      if (!el) return null;
      return animate(el, { strokeDasharray: [`0 ${circ}`, a.dash] }, { duration: 0.8, ease: "easeOut", delay: 0.15 });
    });
    return () => anims.forEach((a) => a?.stop());
  }, [arcs, circ]);

  return (
    <div className="relative shrink-0" onMouseLeave={() => setHovered(null)}>
      <div className="relative h-56 w-56">
        <svg viewBox="6 6 88 88" className="h-full w-full">
          {arcs.map((a) => (
            <circle
              id={`arc-${a.key}`}
              key={a.key}
              cx={cx} cy={cy} r={r} fill="none"
              stroke={a.color} strokeWidth={sw}
              strokeDasharray={a.dash} strokeDashoffset={a.off}
              transform={`rotate(-90 ${cx} ${cy})`}
              className="cursor-pointer transition-opacity hover:opacity-80"
              onMouseEnter={() => setHovered({ key: a.key, label: a.label, value: a.value, total: stats.total })}
              style={{ outline: "none" }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-[#F1F1F3]">{stats.pct}%</span>
          <span className="text-sm text-[#8B8B93] mt-0.5">pass rate</span>
        </div>
      </div>
      {hovered && (
        <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-lg border border-[#2A2D2E] bg-[#1A1D1E] px-4 py-2.5 text-sm font-medium text-[#E8E8E8] whitespace-nowrap shadow-lg">
          {hovered.label}: {hovered.value}/{hovered.total}
        </div>
      )}
    </div>
  );
}
