import { useNavigate, useFetcher } from "react-router";
import { db } from "~/db";
import { questionnaire, control, policyCheck } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { eq } from "drizzle-orm";
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

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { ok: false, error: "Not authenticated" };


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
  const controlsList = await db.select().from(control).where(eq(control.framework, "soc2"));

  const controlsSummary = `SOC 2: ${controlsList.length} controls`;
  const evidenceSummary = agentVerdicts.length > 0
    ? `Agent checked ${agentVerdicts.length} controls. ${agentVerdicts.filter((v) => v.status === "pass").length} passed, ${agentVerdicts.filter((v) => v.status === "fail").length} failed, ${agentVerdicts.filter((v) => v.status === "warning").length} need review.`
    : "No agent audit run yet. Connect integrations and run an audit first.";

  let parsed: Awaited<ReturnType<typeof parseQuestionnaire>>;
  let status = "completed";

  try {
    parsed = await parseQuestionnaire(text, {
      name: session.user.name,
      evidenceSummary,
      controlsSummary,
    });
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
        <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Questionnaire Processed</h1>
        <div className="rounded-xl border border-[#00D4AA]/30 bg-[#111116] p-6 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-[#0A0A0C] p-3 text-center">
              <p className="text-2xl font-bold text-[#F1F1F3]">{result.questionsCount}</p>
              <p className="text-xs text-[#5C5C66] uppercase tracking-wider">Questions parsed</p>
            </div>
            <div className="rounded-lg bg-[#0A0A0C] p-3 text-center">
              <p className="text-2xl font-bold text-[#00D4AA]">{result.avgConfidence}%</p>
              <p className="text-xs text-[#5C5C66] uppercase tracking-wider">Avg confidence</p>
            </div>
            <div className="rounded-lg bg-[#0A0A0C] p-3 text-center">
              <p className="text-2xl font-bold capitalize text-[#F1F1F3]">{result.status}</p>
              <p className="text-xs text-[#5C5C66] uppercase tracking-wider">Status</p>
            </div>
          </div>

          {result.suggestedMappings && result.suggestedMappings.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#F1F1F3]">Evidence-to-Control Mappings</h3>
              <div className="mt-2 space-y-1">
                {result.suggestedMappings.slice(0, 5).map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#8B8B93]">
                    <span className="font-mono text-[#00D4AA]">{m.controlId}</span>
                    <span className="text-[#5C5C66]">{m.reason}</span>
                    <span className="ml-auto text-[#5C5C66]">{Math.round(m.confidence * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => navigate(`/dashboard/questionnaires/${result.id}`)}
            className="rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-colors">
            View details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Upload Questionnaire</h1>
      <p className="text-sm text-[#8B8B93]">Upload a security questionnaire (PDF, text, or markdown). AI parses each question and generates answers with evidence mappings.</p>

      {result?.error && <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">{result.error}</div>}

      <fetcher.Form method="POST" encType="multipart/form-data" className="space-y-5 rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-[#8B8B93]">Title (optional)</label>
          <input name="title" className="w-full rounded-lg border border-[#1C1C24] bg-[#0A0A0C] px-3 py-2 text-sm text-[#F1F1F3] placeholder-[#5C5C66] focus:border-[#00D4AA] focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-[#8B8B93]">Questionnaire file</label>
          <input type="file" name="file" accept=".txt,.md,.csv,.pdf,.html" required
            className="w-full text-sm text-[#8B8B93] file:mr-3 file:rounded-lg file:border-0 file:bg-[#00D4AA] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-black file:hover:bg-[#00B894] file:transition-colors file:cursor-pointer" />
          <p className="mt-1 text-xs text-[#5C5C66]">Supports .txt, .md, .csv, .pdf, .html</p>
        </div>
        <button type="submit" disabled={fetcher.state !== "idle"}
          className="rounded-lg bg-[#00D4AA] px-5 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-colors disabled:opacity-50">
          {fetcher.state !== "idle" ? "Processing with AI..." : "Upload & Auto-fill"}
        </button>
      </fetcher.Form>
    </div>
  );
}
