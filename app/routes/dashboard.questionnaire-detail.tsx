export function meta({ loaderData }: Route.MetaArgs) {
  const title = (loaderData as any)?.questionnaire?.title || "Questionnaire";
  return [{ title: `${title} | Spire` }, { name: "description", content: "Security questionnaire detail" }];
}

import { useState, useRef, useEffect } from "react";
import { redirect, useRevalidator, useFetcher } from "react-router";
import { useQuestionnairePdf } from "~/pdf-download.client";
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks";
import { db } from "~/db";
import { questionnaire, policyCheck, control } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { eq } from "drizzle-orm";
import { hasActiveSubscription } from "~/lib/subscription-check";
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
  const tag = `questionnaire:${params.id}`;
  let accessToken: string | null = null;
  try {
    const { auth: triggerAuth } = await import("@trigger.dev/sdk");
    accessToken = await triggerAuth.createPublicToken({ scopes: { read: { tags: [tag] } } });
  } catch { /* trigger not available */ }
  return { questionnaire: q, hasAudit, tag, accessToken };
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
      return redirect("/dashboard/questionnaires");
    }

    const file = formData.get("file") as File; // must be after delete check

    const fileEntry = formData.get("file");
    if (!fileEntry) return { ok: false, error: "No file provided" };
    if (!(fileEntry instanceof File)) return { ok: false, error: "File field was not uploaded as a file. Try a different browser or file." };
    if (fileEntry.size === 0) return { ok: false, error: "Empty file. Please select a non-empty file." };

    if (fileEntry.size > 5 * 1024 * 1024) return { ok: false, error: "File too large (max 5 MB)." };

    const { tasks } = await import("@trigger.dev/sdk");

    const buffer = await fileEntry.arrayBuffer();
    const rawText = fileEntry.type === "application/pdf" ? await extractPdfText(buffer) : new TextDecoder().decode(buffer);
    if (rawText.trim().length < 10) return { ok: false, error: "Could not extract text from file. Is it a valid questionnaire?" };

    const agentVerdicts = await db.select().from(policyCheck).where(eq(policyCheck.organizationId, orgId));
    const controlsList = await db.select().from(control);
    const verdictText = agentVerdicts.map((v) => `${v.ruleId}: ${v.status} - ${v.detail || "no detail"}`).join("\n");
    const controlsText = controlsList.map((c) => `${c.controlId} (${c.framework}): ${c.title}`).join("\n");

    const handle =     await tasks.trigger("process-questionnaire", {
      orgId, questionnaireId: params.id, rawText, verdictText, controlsText,
    }, { tags: [`org:${orgId}`, `questionnaire:${params.id}`] });

    await db.update(questionnaire).set({
      title: fileEntry.name, originalFile: fileEntry.name, status: "processing",
    }).where(eq(questionnaire.id, params.id));

    return { ok: true };
  } catch (err) {
    console.error("Questionnaire action failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "An unexpected error occurred." };
  }
}

export default function QuestionnaireDetail({ loaderData }: Route.ComponentProps) {
  if (!loaderData) return <p className="text-text-tertiary">Questionnaire not found.</p>;
  const { questionnaire: q, hasAudit, tag, accessToken } = loaderData;
  const revalidator = useRevalidator();
  const fetcher = useFetcher();
  const uploading = fetcher.state !== "idle";
  const actionErr = fetcher.data && typeof fetcher.data === "object" && "error" in fetcher.data ? (fetcher.data as { error: string }).error : null;
  useEffect(() => {
    if (fetcher.data && typeof fetcher.data === "object" && "ok" in fetcher.data && (fetcher.data as any).ok) {
      revalidator.revalidate();
    }
  }, [fetcher.data, revalidator]);

  const runEnabled = !!accessToken;
  const { runs } = useRealtimeRunsWithTag(tag, {
    accessToken: accessToken || undefined,
    enabled: runEnabled,
  });
  const latestRun = runs?.[0];
  const runProcessing = latestRun && ["PENDING", "RUNNING", "QUEUED", "WAITING"].includes(latestRun.status);
  const isProcessing = runProcessing || q.status === "processing";
  useEffect(() => {
    if (latestRun && latestRun.status === "COMPLETED") {
      revalidator.revalidate();
    }
  }, [latestRun, revalidator]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<QuestionItem[]>(
    q.questions ? (q.questions as QuestionItem[]) : []
  );

  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const displayQuestions = questions;
  const avgConfidence = displayQuestions.length > 0 ? displayQuestions.reduce((s, qa) => s + qa.confidence, 0) / displayQuestions.length : 0;
  const isDraft = (q.status === "draft" || (!q.originalFile && displayQuestions.length === 0)) && !isProcessing;

  const startEdit = (i: number) => { setEditingIdx(i); setEditValue(displayQuestions[i].answer); };
  const saveEdit = () => {
    if (editingIdx === null) return;
    setQuestions((prev) => prev.map((item, i) => i === editingIdx ? { ...item, answer: editValue, confidence: -1 } : item));
    setEditingIdx(null);
    setEditValue("");
  };
  const cancelEdit = () => { setEditingIdx(null); setEditValue(""); };

  const pdfUrl = useQuestionnairePdf?.(window.location.origin, q.title || "Questionnaire", new Date().toISOString().split("T")[0], displayQuestions) ?? null;

  const statusLabel = q.status;
  const statusDot = statusLabel === "completed" ? "bg-brand" : statusLabel === "processing" ? "bg-warning" : statusLabel === "flagged" ? "bg-error" : "bg-text-tertiary";
  const statusBadge = statusLabel === "completed" ? "bg-brand/10 text-brand" : statusLabel === "processing" ? "bg-warning/10 text-warning" : statusLabel === "flagged" ? "bg-error/10 text-error" : "bg-surface-elevated text-text-tertiary";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">{q.title || "New Questionnaire"}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-text-tertiary">
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg>
            {displayQuestions.length > 0 ? `${displayQuestions.length} questions` : "No questions yet"}
            {q.createdAt && ` · ${new Date(q.createdAt).toLocaleDateString()}`}
            {q.originalFile && ` · ${q.originalFile}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form method="POST" action={`/dashboard/questionnaires/${q.id}`} onSubmit={(e) => { if (!confirm("Delete this questionnaire?")) e.preventDefault(); }} className="inline">
            <input type="hidden" name="intent" value="delete" />
            <button type="submit"
              className="inline-flex h-10 items-center rounded-[20px] border border-border-primary px-5 text-sm font-medium text-text-secondary transition-all hover:border-error/30 hover:text-error">
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4h12M5 4V2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V4M4 4v9.5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4"/></svg>
              Delete
            </button>
          </form>
          {q.originalFile && (typeof pdfUrl !== "undefined" && pdfUrl) && (
            <a href={pdfUrl} download={`${(q.title || "questionnaire").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`}
              className="inline-flex h-10 items-center rounded-[20px] border border-border-primary px-5 text-sm font-medium text-text-secondary transition-all hover:border-brand/40 hover:text-brand">
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v10M4 8l4 4 4-4M2 14h12"/></svg>
              Export PDF
            </a>
          )}
          <span className={`flex shrink-0 items-center gap-1.5 text-sm px-3 py-1.5 rounded-full ${statusBadge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
            {statusLabel}
          </span>
        </div>
      </div>

      {actionErr && (
        <div className="rounded-xl border border-error/20 bg-error-subtle px-4 py-3 text-sm text-error">{actionErr}</div>
      )}

      {/* Processing state */}
      {isProcessing && (
        <div className="rounded-xl border border-warning/20 bg-warning-subtle px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="absolute inset-0 animate-ping rounded-full bg-warning/40" />
              <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-warning/30 border-t-warning" />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-warning">Processing questionnaire</p>
                <span className="flex gap-0.5">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-warning" style={{ animationDelay: "0ms" }} />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-warning" style={{ animationDelay: "150ms" }} />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-warning" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-elevated">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-warning to-brand" style={{ animationDuration: "2s" }} />
              </div>
              <p className="mt-1.5 text-xs text-text-tertiary">AI is parsing and investigating your questionnaire. Page will update when complete.</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload area - shown when draft or no questions */}
      {isDraft && (
        <fetcher.Form method="POST" encType="multipart/form-data" action={`/dashboard/questionnaires/${q.id}`} className="space-y-4">
          <input ref={fileInputRef} id="questionnaire-file" type="file" name="file" accept=".txt,.md,.csv,.pdf,.html" required className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setSelectedFile(f); }} />
          <div className="rounded-xl border border-dashed border-border-primary bg-surface-secondary p-6">
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-border-primary bg-surface-primary px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-elevated">
                    <svg className="h-5 w-5 text-text-tertiary" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5l-4-4z"/><path d="M9 1v4h4"/></svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">{selectedFile.name}</p>
                    <p className="text-xs text-text-tertiary">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="shrink-0 rounded p-1 text-text-tertiary hover:bg-surface-elevated hover:text-error transition-colors">
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
                  </button>
                </div>
                <button type="submit" disabled={uploading}
                  className="inline-flex h-10 w-full items-center justify-center rounded-[20px] bg-brand px-5 text-sm font-semibold text-black transition-all hover:bg-brand-dark hover:scale-[0.97] active:scale-[0.95] disabled:opacity-50">
                  {uploading ? "Uploading..." : "Upload & parse questions"}
                </button>
              </div>
            ) : (
              <label htmlFor="questionnaire-file" className="flex cursor-pointer flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-primary bg-surface-tertiary">
                  <svg className="h-6 w-6 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-text-primary">Upload a questionnaire</p>
                  <p className="text-xs text-text-tertiary mt-0.5">PDF, TXT, MD, CSV, or HTML</p>
                </div>
              </label>
            )}
          </div>
          {!hasAudit && (
            <p className="text-xs text-warning text-center">&#9888; Run an AI audit from the overview page first for better answers.</p>
          )}
        </fetcher.Form>
      )}

      {/* Confidence bar */}
      {displayQuestions.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border-primary bg-surface-secondary">
          <div className="flex items-center justify-between border-b border-border-primary bg-gradient-to-r from-brand/[0.05] to-transparent px-5 py-3">
            <span className="text-sm font-medium text-text-secondary">Overall AI confidence</span>
            <span className="text-xl font-bold text-brand">{Math.round(avgConfidence * 100)}%</span>
          </div>
          <div className="px-5 py-4">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-elevated">
              <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-500" style={{ width: `${avgConfidence * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      {displayQuestions.length > 0 && (
        <div className="space-y-3">
          {displayQuestions.map((item, i) => (
            <div key={i} className="rounded-xl border border-border-primary bg-surface-secondary p-5 transition-all duration-200 hover:border-border-secondary">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border-primary bg-surface-tertiary text-xs font-bold text-text-secondary">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium text-text-primary">{item.question}</h3>
                    {item.category && (
                      <span className="shrink-0 rounded-md bg-surface-elevated px-2 py-0.5 text-[10px] uppercase tracking-wider text-text-tertiary">{item.category.replace("_", " ")}</span>
                    )}
                  </div>
                  {editingIdx === i ? (
                    <div className="mt-2.5 space-y-2">
                      <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)}
                        className="w-full rounded-lg border border-brand/30 bg-surface-primary px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20 transition-all min-h-[80px]" />
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={saveEdit} className="inline-flex items-center rounded-[20px] bg-brand px-4 py-1.5 text-xs font-semibold text-black transition-all hover:bg-brand-dark hover:scale-[0.97] active:scale-[0.95]">Save</button>
                        <button type="button" onClick={cancelEdit} className="inline-flex items-center rounded-[20px] border border-border-primary px-4 py-1.5 text-xs font-medium text-text-secondary transition-all hover:border-brand/40 hover:text-text-primary">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">{item.answer}</p>
                      {item.confidence >= 0 ? (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-elevated">
                            <div className={`h-full rounded-full transition-all duration-500 ${item.confidence > 0.7 ? "bg-brand" : item.confidence > 0.4 ? "bg-warning" : "bg-error"}`}
                              style={{ width: `${item.confidence * 100}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${item.confidence > 0.7 ? "text-brand" : item.confidence > 0.4 ? "text-warning" : "text-error"}`}>
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                      ) : (
                        <p className="mt-2 text-[10px] uppercase tracking-wider text-text-tertiary">Manually edited</p>
                      )}
                      <button type="button" onClick={() => startEdit(i)} className="mt-2 text-xs text-text-tertiary hover:text-brand transition-colors">Edit answer</button>
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
