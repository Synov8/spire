export function meta() {
  return [{ title: "Questionnaires | Spire" }, { name: "description", content: "Upload and manage security questionnaires" }];
}

import { useEffect } from "react";
import { useLoaderData, Link, redirect, useFetcher } from "react-router";
import { db } from "~/db";
import { questionnaire } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { eq } from "drizzle-orm";
import { hasActiveSubscription } from "~/lib/subscription-check";
import type { Route } from "./+types/dashboard.questionnaires";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { questionnaires: [] };
  const orgId = session.session.activeOrganizationId!;
  if (!await hasActiveSubscription(orgId, session.user.id)) throw redirect("/dashboard/billing");
  return { questionnaires: await db.select().from(questionnaire).where(eq(questionnaire.organizationId, orgId)) };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { ok: false };
  const orgId = session.session.activeOrganizationId!;
  const id = crypto.randomUUID();
  await db.insert(questionnaire).values({ id, organizationId: orgId, title: "New Questionnaire", status: "draft", questions: [], createdAt: new Date() });
  return { ok: true, id };
}

export default function Questionnaires({ loaderData }: Route.ComponentProps) {
  const { questionnaires } = loaderData;
  const fetcher = useFetcher();
  const createData = fetcher.data as { ok?: boolean; id?: string } | null;
  useEffect(() => {
    if (createData?.ok && createData.id) {
      window.location.href = `/dashboard/questionnaires/${createData.id}`;
    }
  }, [createData]);

  const statusConfig: Record<string, { dot: string; badge: string }> = {
    completed: { dot: "bg-brand", badge: "bg-brand/10 text-brand" },
    processing: { dot: "bg-warning", badge: "bg-warning/10 text-warning" },
    flagged: { dot: "bg-error", badge: "bg-error/10 text-error" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Questionnaires</h1>
          <p className="mt-1 text-sm text-text-secondary">Upload security questionnaires and let AI auto-fill answers</p>
        </div>
        <button type="button" onClick={async () => {
          fetcher.submit({}, { method: "POST" });
        }} disabled={fetcher.state !== "idle"}
          className="rounded-[20px] bg-brand px-4 py-2 text-sm font-medium text-black hover:bg-brand-dark transition-all duration-200 shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">
          {fetcher.state !== "idle" ? "Creating..." : "New questionnaire"}
        </button>
      </div>

      {questionnaires.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-primary bg-surface-secondary/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border-primary bg-surface-tertiary">
            <svg className="h-6 w-6 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>
          </div>
          <p className="mt-4 text-sm font-medium text-text-secondary">No questionnaires yet</p>
          <p className="mt-1 text-xs text-text-tertiary">Upload a security questionnaire to auto-fill answers with AI.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {questionnaires.map((q) => {
            const rawQuestions = q.questions ? (q.questions as Array<{ confidence: number }>) : [];
            const avg = rawQuestions.length > 0 ? rawQuestions.reduce((s, qa) => s + qa.confidence, 0) / rawQuestions.length : 0;
            const cfg = statusConfig[q.status] ?? { dot: "bg-text-tertiary", badge: "bg-surface-tertiary text-text-tertiary" };
            return (
              <Link key={q.id} to={`/dashboard/questionnaires/${q.id}`}
                className="group rounded-xl border border-border-primary bg-surface-secondary p-5 transition-all duration-200 hover:border-brand/30 hover:bg-surface-secondary">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-text-primary group-hover:text-white transition-colors">{q.title || "Untitled Questionnaire"}</h3>
                    <p className="mt-0.5 text-xs text-text-tertiary">
                      {rawQuestions.length} questions · {new Date(q.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`flex shrink-0 items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full ${cfg.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {q.status}
                  </span>
                </div>
                {avg > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-tertiary">AI confidence</span>
                      <span className="font-medium text-brand">{Math.round(avg * 100)}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border-primary">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-500" style={{ width: `${avg * 100}%` }} />
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
