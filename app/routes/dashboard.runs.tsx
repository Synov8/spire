export function meta() {
  return [{ title: "Audit Runs | Spire" }, { name: "description", content: "Past compliance audit runs" }];
}

import { Link, redirect } from "react-router";
import { auth } from "~/lib/auth.server";
import type { Route } from "./+types/dashboard.runs";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/login");
  const orgId = session.session.activeOrganizationId!;
  let runs: any[] = [];
  try {
    const { runs: triggerRuns } = await import("@trigger.dev/sdk");
    const result = await triggerRuns.list({ tag: `org:${orgId}`, taskIdentifier: "run-audit", limit: 50 });
    runs = (result as any).data || [];
  } catch { /* trigger not available */ }
  return { runs };
}

export default function RunsPage({ loaderData }: Route.ComponentProps) {
  const { runs } = loaderData as any;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Audit Runs</h1>
        <p className="mt-1 text-sm text-text-tertiary">Past and current compliance audit runs</p>
      </div>

      {runs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-primary bg-surface-secondary/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border-primary bg-surface-tertiary">
            <svg className="h-6 w-6 text-text-tertiary" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 1.5l5.5 2v4c0 3.5-2.5 6-5.5 7-3-1-5.5-3.5-5.5-7v-4l5.5-2z"/><path d="M5.5 8l2 2 3-3.5"/></svg>
          </div>
          <p className="mt-4 text-sm font-medium text-text-secondary">No audit runs yet</p>
          <p className="mt-1 text-xs text-text-tertiary">Run an audit from the overview page.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {runs.map((run: any) => {
            const isActive = ["QUEUED", "EXECUTING", "WAITING"].includes(run.status);
            const statusDot = run.status === "COMPLETED" ? "bg-brand"
              : run.status === "FAILED" || run.status === "CRASHED" || run.status === "SYSTEM_FAILURE" ? "bg-error"
              : isActive ? "bg-warning"
              : "bg-text-tertiary";

            return (
              <Link key={run.id} to={`/dashboard/audit?runId=${run.id}`}
                className="flex items-center gap-3 rounded-xl border border-border-primary bg-surface-secondary p-4 transition-all hover:border-border-secondary">
                <span className={`h-2 w-2 shrink-0 rounded-full ${statusDot} ${isActive ? "animate-pulse" : ""}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary">{run.id?.slice(0, 20)}…</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{run.status?.toLowerCase()} · {run.createdAt ? new Date(run.createdAt).toLocaleString() : "unknown date"}</p>
                </div>
                {isActive && <span className="rounded bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">Live</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
