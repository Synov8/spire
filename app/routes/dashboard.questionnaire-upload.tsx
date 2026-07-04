import { useNavigate, useFetcher, redirect } from "react-router";
import { db } from "~/db";
import { questionnaire, control, policyCheck } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { eq } from "drizzle-orm";
import { hasActiveSubscription } from "~/lib/subscription-check";
import { parseQuestionnaire } from "~/lib/ai";
import type { Route } from "./+types/dashboard.questionnaire-upload";

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: Buffer.from(buffer) });
    const result = await parser.getText();
    return result?.text || result?.pages?.map((p: { text?: string }) => p.text).join("\n") || "";
  } catch {
    const raw = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    const textChunks = raw.match(/\(([^)]*)\)/g) || [];
    if (textChunks.length > 5) return textChunks.map((s) => s.slice(1, -1)).join("\n");
    return raw.replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim().substring(0, 10000);
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/login");
  const orgId = session.session.activeOrganizationId!;
  if (!await hasActiveSubscription(orgId, session.user.id)) throw redirect("/dashboard/billing");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { ok: false, error: "Not authenticated" };
  if (!await hasActiveSubscription(session.session.activeOrganizationId!, session.user.id)) return { ok: false, error: "Subscription required" };


  const formData = await request.formData();
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  if (!file) return { ok: false, error: "No file provided" };

  const buffer = await file.arrayBuffer();
  const text = file.type === "application/pdf"
    ? await extractPdfText(buffer)
    : new TextDecoder().decode(buffer);
  const orgId = session.session.activeOrganizationId!;
  const agentVerdicts = await db.select().from(policyCheck).where(eq(policyCheck.organizationId, orgId));
  if (agentVerdicts.length === 0) {
    return { ok: false, error: "No audit data found. Run an AI audit from the dashboard first so Spire has evidence to draw from." };
  }
  const controlsList = await db.select().from(control);
  const verdictText = agentVerdicts.map((v) => `${v.ruleId}: ${v.status} — ${v.detail || "no detail"}`).join("\n");
  const controlsText = controlsList.map((c) => `${c.controlId} (${c.framework}): ${c.title}`).join("\n");

  let parsed: Awaited<ReturnType<typeof parseQuestionnaire>>;
  let status = "completed";

  try {
    parsed = await parseQuestionnaire(text, verdictText, controlsText);
  } catch {
    status = "flagged";
    parsed = { questions: [] };
  }

  const id = crypto.randomUUID();

  await db.insert(questionnaire).values({
    id, organizationId: orgId, title: title || file.name, status, originalFile: file.name,
    questions: parsed.questions,
    createdAt: new Date(),
    completedAt: status === "completed" ? new Date() : undefined,
  });

  const avg = parsed.questions.length > 0 ? Math.round(parsed.questions.reduce((s, q) => s + q.confidence, 0) / parsed.questions.length * 100) : 0;
  return { ok: true, id, questionsCount: parsed.questions.length, avgConfidence: avg, status };
}

export default function UploadQuestionnaire() {
  const fetcher = useFetcher();
  const result = fetcher.data as {
    ok?: boolean; error?: string; id?: string; questionsCount?: number; avgConfidence?: number; status?: string;
    suggestedMappings?: Array<{ evidenceId: string; controlId: string; confidence: number; reason: string }>;
  } | null;
  const navigate = useNavigate();

  if (result?.ok && result.id) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Questionnaire Processed</h1>
          <p className="mt-1 text-sm text-[#6A6D6E]">AI has parsed and answered your security questionnaire</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#00D4AA]/30 bg-[#0B0D0E] shadow-[0_8px_40px_-10px_rgba(0,212,170,0.1)]">
          <div className="flex items-center gap-2 border-b border-[#00D4AA]/20 bg-gradient-to-r from-[#00D4AA]/[0.06] to-transparent px-6 py-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00D4AA]/15 text-[#00D4AA]">
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>
            </span>
            <span className="text-sm font-semibold text-[#00D4AA]">Processing complete</span>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-[#1A1D1E] bg-[#07080A] p-4 text-center">
                <p className="text-2xl font-bold text-[#F1F1F3]">{result.questionsCount}</p>
                <p className="mt-1 text-xs text-[#5C5C66] uppercase tracking-wider">Questions parsed</p>
              </div>
              <div className="rounded-xl border border-[#1A1D1E] bg-[#07080A] p-4 text-center">
                <p className="text-2xl font-bold text-[#00D4AA]">{result.avgConfidence}%</p>
                <p className="mt-1 text-xs text-[#5C5C66] uppercase tracking-wider">Avg confidence</p>
              </div>
              <div className="rounded-xl border border-[#1A1D1E] bg-[#07080A] p-4 text-center">
                <p className="text-2xl font-bold capitalize text-[#F1F1F3]">{result.status}</p>
                <p className="mt-1 text-xs text-[#5C5C66] uppercase tracking-wider">Status</p>
              </div>
            </div>

            {result.suggestedMappings && result.suggestedMappings.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#F1F1F3]">Evidence-to-Control Mappings</h3>
                <div className="mt-3 space-y-2">
                  {result.suggestedMappings.slice(0, 5).map((m, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-[#1A1D1E] bg-[#07080A] px-3 py-2">
                      <span className="rounded bg-[#00D4AA]/10 px-2 py-0.5 font-mono text-xs text-[#00D4AA]">{m.controlId}</span>
                      <span className="flex-1 truncate text-xs text-[#8B8B93]">{m.reason}</span>
                      <span className="text-xs text-[#5C5C66]">{Math.round(m.confidence * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => navigate(`/dashboard/questionnaires/${result.id}`)}
              className="rounded-lg bg-[#00D4AA] px-5 py-2.5 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">
              View details →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Upload Questionnaire</h1>
        <p className="mt-1 text-sm text-[#6A6D6E]">Upload a security questionnaire (PDF, text, or markdown). AI parses each question and generates answers with evidence mappings.</p>
      </div>

      {result?.error && <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/[0.06] px-4 py-3 text-sm text-[#EF4444]">{result.error}</div>}

      <fetcher.Form method="POST" encType="multipart/form-data" className="space-y-6 overflow-hidden rounded-2xl border border-[#1A1D1E] bg-[#0B0D0E] p-6">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#8B8B93]">Title (optional)</label>
          <input name="title" placeholder="e.g. Acme Corp Security Questionnaire 2026"
            className="w-full rounded-lg border border-[#1A1D1E] bg-[#07080A] px-3.5 py-2.5 text-sm text-[#F1F1F3] placeholder-[#5C5C66] focus:border-[#00D4AA] focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/20 transition-all" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#8B8B93]">Questionnaire file</label>
          <div className="rounded-xl border border-[#1A1D1E] bg-[#07080A] p-4">
            <input type="file" name="file" accept=".txt,.md,.csv,.pdf,.html" required
              className="w-full text-sm text-[#8B8B93] file:mr-3 file:rounded-lg file:border-0 file:bg-[#00D4AA] file:px-4 file:py-2 file:text-sm file:font-medium file:text-black file:hover:bg-[#00B894] file:transition-all file:cursor-pointer" />
          </div>
          <p className="mt-2 text-xs text-[#5C5C66]">Supports .txt, .md, .csv, .pdf, .html</p>
        </div>
        <button type="submit" disabled={fetcher.state !== "idle"}
          className="rounded-lg bg-[#00D4AA] px-5 py-2.5 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">
          {fetcher.state !== "idle" ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              Processing with AI…
            </span>
          ) : (
            "Upload & Auto-fill"
          )}
        </button>
      </fetcher.Form>
    </div>
  );
}
