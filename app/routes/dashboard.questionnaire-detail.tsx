import { useLoaderData } from "react-router";
import { db } from "~/db";
import { questionnaire } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { eq, and } from "drizzle-orm";
import type { Route } from "./+types/dashboard.questionnaire-detail";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;
  const orgId = session.session.activeOrganizationId!;
  const q = await db.select().from(questionnaire).where(and(eq(questionnaire.id, params.id), eq(questionnaire.organizationId, orgId))).then((r) => r[0] || null);
  if (!q) return null;
  return { questionnaire: q };
}

export default function QuestionnaireDetail({ loaderData }: Route.ComponentProps) {
  if (!loaderData) return <p className="text-[#5C5C66]">Questionnaire not found.</p>;

  const q = loaderData.questionnaire;
  const questions = q.questions ? (q.questions as Array<{ question: string; answer: string; confidence: number; category: string }>) : [];
  const avgConfidence = questions.length > 0 ? questions.reduce((s, qa) => s + qa.confidence, 0) / questions.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">{q.title || "Untitled"}</h1>
          <p className="mt-1 text-sm text-[#8B8B93]">
            {questions.length} questions · Uploaded {new Date(q.createdAt).toLocaleDateString()}
            {q.completedAt && ` · Completed ${new Date(q.completedAt).toLocaleDateString()}`}
          </p>
        </div>
        <span className={`shrink-0 text-sm px-3 py-1 rounded ${
          q.status === "completed" ? "bg-[#00D4AA]/10 text-[#00D4AA]"
          : q.status === "flagged" ? "bg-[#EF4444]/10 text-[#EF4444]"
          : "bg-[#1C1C24] text-[#5C5C66]"
        }`}>{q.status}</span>
      </div>

      {avgConfidence > 0 && (
        <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#8B8B93]">Overall AI confidence</span>
            <span className="text-lg font-bold text-[#00D4AA]">{Math.round(avgConfidence * 100)}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#1C1C24]">
            <div className="h-full rounded-full bg-[#00D4AA] transition-all" style={{ width: `${avgConfidence * 100}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {questions.map((item, i) => (
          <div key={i} className="rounded-xl border border-[#1C1C24] bg-[#111116] p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#1C1C24] text-xs text-[#5C5C66]">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-medium text-[#F1F1F3]">{item.question}</h3>
                  {item.category && (
                    <span className="shrink-0 rounded bg-[#1C1C24] px-2 py-0.5 text-[10px] uppercase text-[#5C5C66]">{item.category.replace("_", " ")}</span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#8B8B93]">{item.answer}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#5C5C66]">
                  <span className={`flex items-center gap-1 ${item.confidence > 0.7 ? "text-[#00D4AA]" : item.confidence > 0.4 ? "text-[#F59E0B]" : "text-[#EF4444]"}`}>
                    Confidence: {Math.round(item.confidence * 100)}%
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
