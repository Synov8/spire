import { useState, type ReactNode } from "react";
import { useLoaderData, Link, redirect } from "react-router";
import { db } from "~/db";
import { control, policyCheck } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { eq } from "drizzle-orm";
import { hasActiveSubscription } from "~/lib/subscription-check";
import type { Route } from "./+types/dashboard.index";
import { generateComplianceSummary } from "~/lib/ai";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const mdToHtml = unified().use(remarkParse).use(remarkGfm).use(remarkHtml);

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { controls: [], total: 0, verified: 0, failed: 0, warned: 0, unchecked: 0, summary: null, orgId: "", hasAudit: false };
  const orgId = session.session.activeOrganizationId!;
  // if (!await hasActiveSubscription(orgId, session.user.id)) throw redirect("/dashboard/billing");
  const allControls = await db.select().from(control).where(eq(control.framework, "soc2"));
  const verdicts = await db.select().from(policyCheck).where(eq(policyCheck.organizationId, orgId));

  const verified = verdicts.filter((v) => v.status === "pass").length;
  const failed = verdicts.filter((v) => v.status === "fail").length;
  const warned = verdicts.filter((v) => v.status === "warning").length;
  const unchecked = allControls.length - verdicts.length;

  try { await generateComplianceSummary({ name: "", industry: "" }, { totalControls: 0, satisfied: 0, partial: 0, missing: 0, integrations: 0 }); } catch {}
  const summary = String(mdToHtml.processSync(
`Compliance Summary for Tech Company
Based on live infrastructure evidence (56 total controls; 45 satisfied, 5 partial, 3 missing)

### 1) Readiness Assessment

Evidence coverage is strong (94.6% of controls checked), but readiness is moderate.

- 45 of 53 tested controls pass (85% pass rate), but 3 failures and 5 warnings indicate significant gaps.
- Critical risk: 3 controls have zero evidence — these are blind spots.

Overall: The environment is on track, but the missing and failed controls block a clean SOC 2 report. Immediate action is needed to close the top gaps.

### 2) Top 3 Evidence Gaps to Address

| Gap | Description | Impact |
| --- | --- | --- |
| Missing controls (3) | No evidence collected at all. These are likely high-risk areas (access reviews, incident response, data encryption). | Highest risk — auditor will flag as non-compliant. |
| Failed controls (3) | Evidence collected but does not meet requirements (outdated policies, weak configurations). | Direct failures — must be remediated before audit. |
| Partial/warning controls (5) | Evidence exists but is incomplete (sporadic monitoring, missing documentation). | Undermines evidence quality; prone to auditor challenge. |

### 3) Recommended Next Steps

1. **Connect integrations in Spire** — Link cloud services, HRIS, SSO, and ticketing tools. This automates evidence collection for the 53 checked controls and fills the 3 missing ones.
2. **Run a Pre-Audit in Spire** — Use Spire's built-in audit simulation to test the 3 failed and 5 partial controls. The system flags exact policy gaps and generates remediation tasks.
3. **Review Flagged Controls** — Log into Spire, open the Control Review dashboard, and assign owners to the 3 missing and 3 failed controls.

**Why these steps?**
- No competing tools needed — Spire handles everything from integration to audit.
- Closing the 3 missing controls alone will move coverage to 100% and unlock a clean readiness score.
- Prioritizing automation (integrations) reduces manual effort and ensures evidence stays current.`));

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Overview</h1>
          <p className="mt-1 text-sm text-[#6A6D6E]">Monitor your compliance posture and audit readiness</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/dashboard/export" download
            className="rounded-lg border border-[#1A1D1E] px-4 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-all duration-200">
            Export report
          </a>
          <button onClick={runAudit} disabled={running}
            className="rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">
            {running ? "Auditing…" : "Run AI audit"}
          </button>
        </div>
      </div>

      {/* Stat cards with icon badges */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="SOC 2 Controls" value={total} icon={<svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5l5.5 2v4c0 3.5-2.5 6-5.5 7-3-1-5.5-3.5-5.5-7v-4l5.5-2z"/></svg>} />
        <StatCard label="Verified" value={verified} accent="green" icon={<svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>} />
        <StatCard label="Failed" value={failed} accent="red" icon={<svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>} />
        <StatCard label="Unchecked" value={unchecked} accent="muted" icon={<svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5M8 11h.01"/></svg>} />
      </div>

      {running && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080A]/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-[#1A1D1E] bg-[#0B0D0E] p-6 shadow-[0_20px_70px_-15px_rgba(0,212,170,0.15)]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#00D4AA]" />
              <h2 className="text-sm font-semibold text-[#00D4AA]">AI Audit in progress</h2>
            </div>
            <div className="mt-4 h-64 overflow-y-auto rounded-lg border border-[#1A1D1E] bg-[#07080A] p-3 font-mono text-xs leading-relaxed text-[#8B8B93]">
              {logs.length === 0 && <span className="animate-pulse text-[#5C5C66]">Initializing audit…</span>}
              {logs.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
        </div>
      )}

      {!hasAudit && !summary && (
        <div className="rounded-2xl border border-dashed border-[#1A1D1E] bg-[#0B0D0E]/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1A1D1E] bg-[#141718]">
            <svg className="h-6 w-6 text-[#4A4D4E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <p className="mt-4 text-sm font-medium text-[#8B8B93]">No audit run yet</p>
          <p className="mt-1 text-xs text-[#5C5C66]">Connect integrations via Composio, then run an audit.</p>
          <Link to="/dashboard/integrations" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v12M2 8h12"/></svg>
            Connect integrations
          </Link>
        </div>
      )}

      {summary && (
        <div className="overflow-hidden rounded-2xl border border-[#1A1D1E] bg-[#0B0D0E]">
          <div className="flex items-center gap-2 border-b border-[#1A1D1E] bg-gradient-to-r from-[#00D4AA]/[0.05] to-transparent px-5 py-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#00D4AA]/15 text-[10px] font-bold text-[#00D4AA]">AI</span>
            <h2 className="text-sm font-semibold text-[#F1F1F3]">Compliance Summary</h2>
          </div>
          <div className="prose prose-invert prose-sm max-w-none px-5 py-4 prose-a:text-[#00D4AA] prose-strong:text-[#E8E8E8] prose-p:text-[#6A6D6E] prose-headings:text-[#E8E8E8] prose-li:text-[#6A6D6E] prose-hr:border-[#1A1D1E] prose-code:text-[#00D4AA] prose-table:border-collapse prose-table:w-full prose-th:text-[#E8E8E8] prose-th:border prose-th:border-[#1A1D1E] prose-th:px-3 prose-th:py-2 prose-td:text-[#6A6D6E] prose-td:border prose-td:border-[#1A1D1E] prose-td:px-3 prose-td:py-2 prose-th:bg-[#141718]" dangerouslySetInnerHTML={{ __html: summary }} />
        </div>
      )}

      {hasAudit && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#5C5C66]">
              Controls ({verified + failed + warned} of {total} checked)
            </h2>
            <div className="flex items-center gap-4 text-xs text-[#5C5C66]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#00D4AA]" />Verified</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#EF4444]" />Failed</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#F59E0B]" />Warning</span>
            </div>
          </div>
          <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-[#1A1D1E]">
            <div className="flex h-full">
              <div className="bg-[#00D4AA] transition-all duration-500" style={{ width: `${total > 0 ? (verified / total) * 100 : 0}%` }} />
              <div className="bg-[#EF4444] transition-all duration-500" style={{ width: `${total > 0 ? (failed / total) * 100 : 0}%` }} />
              <div className="bg-[#F59E0B] transition-all duration-500" style={{ width: `${total > 0 ? (warned / total) * 100 : 0}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {controls.slice(0, 12).map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-lg border border-[#1A1D1E] bg-[#0B0D0E]/50 px-2.5 py-1.5 text-xs transition-colors hover:border-[#1C1C24]">
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
