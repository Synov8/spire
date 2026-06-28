import { useLoaderData, Link, redirect } from "react-router";
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

export default function Questionnaires({ loaderData }: Route.ComponentProps) {
  const { questionnaires } = loaderData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Questionnaires</h1>
        <Link to="/dashboard/questionnaires/upload"
          className="rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-colors">
          Upload new
        </Link>
      </div>

      {questionnaires.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#1C1C24] p-10 text-center">
          <p className="text-sm text-[#5C5C66]">No questionnaires yet.</p>
          <p className="mt-1 text-xs text-[#5C5C66]">Upload a security questionnaire to auto-fill answers with AI.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {questionnaires.map((q) => {
            const rawQuestions = q.questions ? (q.questions as Array<{ confidence: number }>) : [];
            const avg = rawQuestions.length > 0 ? rawQuestions.reduce((s, qa) => s + qa.confidence, 0) / rawQuestions.length : 0;
            return (
              <Link key={q.id} to={`/dashboard/questionnaires/${q.id}`}
                className="rounded-xl border border-[#1C1C24] bg-[#111116] p-5 hover:border-[#00D4AA]/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-[#F1F1F3]">{q.title || "Untitled Questionnaire"}</h3>
                    <p className="mt-0.5 text-xs text-[#5C5C66]">
                      {rawQuestions.length} questions · {new Date(q.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded ${
                    q.status === "completed" ? "bg-[#00D4AA]/10 text-[#00D4AA]"
                    : q.status === "processing" ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                    : q.status === "flagged" ? "bg-[#EF4444]/10 text-[#EF4444]"
                    : "bg-[#1C1C24] text-[#5C5C66]"
                  }`}>{q.status}</span>
                </div>
                {avg > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-[#5C5C66]">
                      <span>AI confidence</span>
                      <span className="text-[#00D4AA]">{Math.round(avg * 100)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#1C1C24]">
                      <div className="h-full rounded-full bg-[#00D4AA] transition-all" style={{ width: `${avg * 100}%` }} />
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
