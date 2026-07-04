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
    completed: { dot: "bg-[#00D4AA]", badge: "bg-[#00D4AA]/10 text-[#00D4AA]" },
    processing: { dot: "bg-[#F59E0B]", badge: "bg-[#F59E0B]/10 text-[#F59E0B]" },
    flagged: { dot: "bg-[#EF4444]", badge: "bg-[#EF4444]/10 text-[#EF4444]" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Questionnaires</h1>
          <p className="mt-1 text-sm text-[#6A6D6E]">Upload security questionnaires and let AI auto-fill answers</p>
        </div>
        <button type="button" onClick={async () => {
          fetcher.submit({}, { method: "POST" });
        }} disabled={fetcher.state !== "idle"}
          className="rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">
          {fetcher.state !== "idle" ? "Creating…" : "New questionnaire"}
        </button>
      </div>

      {questionnaires.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#1A1D1E] bg-[#0B0D0E]/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1A1D1E] bg-[#141718]">
            <svg className="h-6 w-6 text-[#4A4D4E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>
          </div>
          <p className="mt-4 text-sm font-medium text-[#8B8B93]">No questionnaires yet</p>
          <p className="mt-1 text-xs text-[#5C5C66]">Upload a security questionnaire to auto-fill answers with AI.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {questionnaires.map((q) => {
            const rawQuestions = q.questions ? (q.questions as Array<{ confidence: number }>) : [];
            const avg = rawQuestions.length > 0 ? rawQuestions.reduce((s, qa) => s + qa.confidence, 0) / rawQuestions.length : 0;
            const cfg = statusConfig[q.status] ?? { dot: "bg-[#5C5C66]", badge: "bg-[#1A1D1E] text-[#5C5C66]" };
            return (
              <Link key={q.id} to={`/dashboard/questionnaires/${q.id}`}
                className="group rounded-2xl border border-[#1A1D1E] bg-[#0B0D0E] p-5 transition-all duration-200 hover:border-[#00D4AA]/30 hover:bg-[#0B0D0E]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-[#F1F1F3] group-hover:text-white transition-colors">{q.title || "Untitled Questionnaire"}</h3>
                    <p className="mt-0.5 text-xs text-[#5C5C66]">
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
                      <span className="text-[#5C5C66]">AI confidence</span>
                      <span className="font-medium text-[#00D4AA]">{Math.round(avg * 100)}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#1A1D1E]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#00D4AA] to-[#00B894] transition-all duration-500" style={{ width: `${avg * 100}%` }} />
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
