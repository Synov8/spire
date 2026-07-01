import { useLoaderData, redirect } from "react-router";
import { db } from "~/db";
import { questionnaire } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { eq, and } from "drizzle-orm";
import { hasActiveSubscription } from "~/lib/subscription-check";
import type { Route } from "./+types/dashboard.questionnaire-detail";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/login");
  const orgId = session.session.activeOrganizationId!;
  if (!await hasActiveSubscription(orgId, session.user.id)) throw redirect("/dashboard/billing");
  const q = await db.select().from(questionnaire).where(and(eq(questionnaire.id, params.id), eq(questionnaire.organizationId, orgId))).then((r) => r[0] || null);
  if (!q) return null;
  return { questionnaire: q };
}

export default function QuestionnaireDetail({ loaderData }: Route.ComponentProps) {
  if (!loaderData) return <p className="text-[#5C5C66]">Questionnaire not found.</p>;

  const q = loaderData.questionnaire;
  const questions = q.questions ? (q.questions as Array<{ question: string; answer: string; confidence: number; category: string }>) : [];
  const avgConfidence = questions.length > 0 ? questions.reduce((s, qa) => s + qa.confidence, 0) / questions.length : 0;

  const statusConfig: Record<string, { dot: string; badge: string }> = {
    completed: { dot: "bg-[#00D4AA]", badge: "bg-[#00D4AA]/10 text-[#00D4AA]" },
    flagged: { dot: "bg-[#EF4444]", badge: "bg-[#EF4444]/10 text-[#EF4444]" },
  };
  const cfg = statusConfig[q.status] ?? { dot: "bg-[#5C5C66]", badge: "bg-[#1A1D1E] text-[#5C5C66]" };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">{q.title || "Untitled"}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-[#6A6D6E]">
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg>
            {questions.length} questions · Uploaded {new Date(q.createdAt).toLocaleDateString()}
            {q.completedAt && ` · Completed ${new Date(q.completedAt).toLocaleDateString()}`}
          </p>
        </div>
        <span className={`flex shrink-0 items-center gap-1.5 text-sm px-3 py-1 rounded-full ${cfg.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {q.status}
        </span>
      </div>

      {avgConfidence > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[#1A1D1E] bg-[#0B0D0E]">
          <div className="flex items-center justify-between border-b border-[#1A1D1E] bg-gradient-to-r from-[#00D4AA]/[0.05] to-transparent px-5 py-3">
            <span className="text-sm font-medium text-[#8B8B93]">Overall AI confidence</span>
            <span className="text-xl font-bold text-[#00D4AA]">{Math.round(avgConfidence * 100)}%</span>
          </div>
          <div className="px-5 py-4">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#1A1D1E]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#00D4AA] to-[#00B894] transition-all duration-500" style={{ width: `${avgConfidence * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {questions.map((item, i) => (
          <div key={i} className="rounded-2xl border border-[#1A1D1E] bg-[#0B0D0E] p-5 transition-all duration-200 hover:border-[#1C1C24]">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#1A1D1E] bg-[#141718] text-xs font-bold text-[#8B8B93]">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-medium text-[#F1F1F3]">{item.question}</h3>
                  {item.category && (
                    <span className="shrink-0 rounded-md bg-[#1A1D1E] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#5C5C66]">{item.category.replace("_", " ")}</span>
                  )}
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-[#8B8B93]">{item.answer}</p>
                {/* Confidence bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#1A1D1E]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.confidence > 0.7 ? "bg-[#00D4AA]" : item.confidence > 0.4 ? "bg-[#F59E0B]" : "bg-[#EF4444]"
                      }`}
                      style={{ width: `${item.confidence * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    item.confidence > 0.7 ? "text-[#00D4AA]" : item.confidence > 0.4 ? "text-[#F59E0B]" : "text-[#EF4444]"
                  }`}>
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
