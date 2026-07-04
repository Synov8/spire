import { useState, useRef, useEffect } from "react";
import { useLoaderData, redirect, useFetcher, useNavigate } from "react-router";
import { db } from "~/db";
import { questionnaire, policyCheck, control } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { eq } from "drizzle-orm";
import { hasActiveSubscription } from "~/lib/subscription-check";
import { parseQuestionnaire } from "~/lib/ai";
import type { Route } from "./+types/dashboard.questionnaire-detail";

type QuestionItem = { question: string; answer: string; confidence: number; category: string };

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

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/login");
  const orgId = session.session.activeOrganizationId!;
  if (!await hasActiveSubscription(orgId, session.user.id)) throw redirect("/dashboard/billing");
  const q = await db.select().from(questionnaire).where(eq(questionnaire.id, params.id)).then((r) => r[0] || null);
  if (!q) return null;
  const hasAudit = await db.select({ id: policyCheck.id }).from(policyCheck).where(eq(policyCheck.organizationId, orgId)).limit(1).then((r) => r.length > 0);
  return { questionnaire: q, hasAudit };
}

export async function action({ request, params }: Route.ActionArgs) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return { ok: false, error: "Not authenticated" };
    const orgId = session.session.activeOrganizationId!;
    if (!await hasActiveSubscription(orgId, session.user.id)) return { ok: false, error: "Subscription required" };

    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "delete") {
      await db.delete(questionnaire).where(eq(questionnaire.id, params.id));
      return { ok: true, deleted: true };
    }

    const file = formData.get("file") as File;
    if (!file) return { ok: false, error: "No file provided" };

    const agentVerdicts = await db.select().from(policyCheck).where(eq(policyCheck.organizationId, orgId));
    if (agentVerdicts.length === 0) return { ok: false, error: "Run an AI audit first so Spire has evidence to draw from." };

    const buffer = await file.arrayBuffer();
    const text = file.type === "application/pdf" ? await extractPdfText(buffer) : new TextDecoder().decode(buffer);
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

    await db.update(questionnaire).set({
      title: file.name, status, originalFile: file.name,
      questions: parsed.questions as any,
      completedAt: status === "completed" ? new Date() : undefined,
    }).where(eq(questionnaire.id, params.id));

    const avg = parsed.questions.length > 0 ? Math.round(parsed.questions.reduce((s, q) => s + q.confidence, 0) / parsed.questions.length * 100) : 0;
    return { ok: true, questions: parsed.questions, avgConfidence: avg, status, questionsCount: parsed.questions.length };
  } catch (err) {
    console.error("Questionnaire action failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "An unexpected error occurred." };
  }
}

export default function QuestionnaireDetail({ loaderData }: Route.ComponentProps) {
  if (!loaderData) return <p className="text-[#5C5C66]">Questionnaire not found.</p>;
  const { questionnaire: q, hasAudit } = loaderData;
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const actionData = fetcher.data as { ok?: boolean; error?: string; questions?: QuestionItem[]; avgConfidence?: number; status?: string; questionsCount?: number; deleted?: boolean } | null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (actionData?.deleted) navigate("/dashboard/questionnaires"); }, [actionData, navigate]);

  const [questions, setQuestions] = useState<QuestionItem[]>(
    q.questions ? (q.questions as QuestionItem[]) : []
  );

  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const displayQuestions = actionData?.questions ?? questions;
  const avgConfidence = displayQuestions.length > 0 ? displayQuestions.reduce((s, qa) => s + qa.confidence, 0) / displayQuestions.length : 0;
  const isDraft = q.status === "draft" || (!q.originalFile && displayQuestions.length === 0);

  const startEdit = (i: number) => { setEditingIdx(i); setEditValue(displayQuestions[i].answer); };
  const saveEdit = () => {
    if (editingIdx === null) return;
    setQuestions((prev) => prev.map((item, i) => i === editingIdx ? { ...item, answer: editValue, confidence: -1 } : item));
    setEditingIdx(null);
    setEditValue("");
  };
  const cancelEdit = () => { setEditingIdx(null); setEditValue(""); };

  const handleDelete = async () => {
    if (!confirm("Delete this questionnaire?")) return;
    fetcher.submit({ intent: "delete" }, { method: "POST" });
  };

  const handleExport = () => {
    const exportData = { title: q.title, status: q.status, generatedAt: new Date().toISOString(), questions: displayQuestions };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(q.title || "questionnaire").replace(/[^a-zA-Z0-9]/g, "_")}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusLabel = actionData?.status ?? q.status;
  const statusDot = statusLabel === "completed" ? "bg-[#00D4AA]" : statusLabel === "flagged" ? "bg-[#EF4444]" : "bg-[#5C5C66]";
  const statusBadge = statusLabel === "completed" ? "bg-[#00D4AA]/10 text-[#00D4AA]" : statusLabel === "flagged" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#1A1D1E] text-[#5C5C66]";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">{q.title || "New Questionnaire"}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-[#6A6D6E]">
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg>
            {displayQuestions.length > 0 ? `${displayQuestions.length} questions` : "No questions yet"}
            {q.createdAt && ` · ${new Date(q.createdAt).toLocaleDateString()}`}
            {q.originalFile && ` · ${q.originalFile}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-lg border border-[#1A1D1E] px-3.5 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#EF4444]/30 hover:text-[#EF4444] transition-all">
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4h12M5 4V2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V4M4 4v9.5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4"/></svg>
            Delete
          </button>
          {q.originalFile && (
            <button type="button" onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg border border-[#1A1D1E] px-3.5 py-2 text-sm font-medium text-[#8B8B93] transition-all hover:border-[#00D4AA] hover:text-[#00D4AA]">
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v10M4 8l4 4 4-4M2 14h12"/></svg>
              Export
            </button>
          )}
          <span className={`flex shrink-0 items-center gap-1.5 text-sm px-3 py-1.5 rounded-full ${statusBadge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
            {statusLabel}
          </span>
        </div>
      </div>

      {actionData?.error && (
        <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/[0.06] px-4 py-3 text-sm text-[#EF4444]">{actionData.error}</div>
      )}

      {/* Upload area — shown when draft or no questions */}
      {isDraft && (
        <fetcher.Form method="POST" encType="multipart/form-data" className="space-y-4">
          <div className="rounded-xl border border-dashed border-[#1A1D1E] bg-[#0B0D0E] p-6">
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-[#1A1D1E] bg-[#07080A] px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A1D1E]">
                    <svg className="h-5 w-5 text-[#6A6D6E]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5l-4-4z"/><path d="M9 1v4h4"/></svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#F1F1F3]">{selectedFile.name}</p>
                    <p className="text-xs text-[#5C5C66]">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="shrink-0 rounded p-1 text-[#5C5C66] hover:bg-[#1A1D1E] hover:text-[#EF4444] transition-colors">
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
                  </button>
                </div>
                <button type="submit" disabled={fetcher.state !== "idle"}
                  className="w-full rounded-lg bg-[#00D4AA] py-2.5 text-sm font-medium text-black hover:bg-[#00B894] transition-all disabled:opacity-50">
                  {fetcher.state !== "idle" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                      Processing…
                    </span>
                  ) : "Upload & parse questions"}
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1A1D1E] bg-[#141718]">
                  <svg className="h-6 w-6 text-[#4A4D4E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-[#F1F1F3]">Upload a questionnaire</p>
                  <p className="text-xs text-[#5C5C66] mt-0.5">PDF, TXT, MD, CSV, or HTML</p>
                </div>
                <input ref={fileInputRef} type="file" name="file" accept=".txt,.md,.csv,.pdf,.html" required className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setSelectedFile(f); }} />
              </label>
            )}
          </div>
          {!hasAudit && (
            <p className="text-xs text-[#F59E0B] text-center">⚠ Run an AI audit from the overview page first for better answers.</p>
          )}
        </fetcher.Form>
      )}

      {/* Confidence bar */}
      {displayQuestions.length > 0 && (
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

      {/* Questions */}
      {displayQuestions.length > 0 && (
        <div className="space-y-3">
          {displayQuestions.map((item, i) => (
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
                  {editingIdx === i ? (
                    <div className="mt-2.5 space-y-2">
                      <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)}
                        className="w-full rounded-lg border border-[#00D4AA]/30 bg-[#07080A] px-3 py-2 text-sm text-[#F1F1F3] focus:border-[#00D4AA] focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/20 transition-all min-h-[80px]" />
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={saveEdit} className="rounded-lg bg-[#00D4AA] px-3 py-1.5 text-xs font-medium text-black hover:bg-[#00B894]">Save</button>
                        <button type="button" onClick={cancelEdit} className="rounded-lg border border-[#1A1D1E] px-3 py-1.5 text-xs font-medium text-[#8B8B93] hover:text-[#F1F1F3]">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-2.5 text-sm leading-relaxed text-[#8B8B93]">{item.answer}</p>
                      {item.confidence >= 0 ? (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#1A1D1E]">
                            <div className={`h-full rounded-full transition-all duration-500 ${item.confidence > 0.7 ? "bg-[#00D4AA]" : item.confidence > 0.4 ? "bg-[#F59E0B]" : "bg-[#EF4444]"}`}
                              style={{ width: `${item.confidence * 100}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${item.confidence > 0.7 ? "text-[#00D4AA]" : item.confidence > 0.4 ? "text-[#F59E0B]" : "text-[#EF4444]"}`}>
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                      ) : (
                        <p className="mt-2 text-[10px] uppercase tracking-wider text-[#5C5C66]">Manually edited</p>
                      )}
                      <button type="button" onClick={() => startEdit(i)} className="mt-2 text-xs text-[#5C5C66] hover:text-[#00D4AA] transition-colors">Edit answer</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
