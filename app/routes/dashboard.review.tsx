import { useState } from "react";
import { useFetcher, redirect } from "react-router";
import { db } from "~/db";
import { policyCheck, control, manualEvidence } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { eq, and, desc, inArray, ne } from "drizzle-orm";
import { hasActiveSubscription } from "~/lib/subscription-check";
import { batchReviewEvaluate } from "~/agents/review-evaluate";
import { cloudflareContext } from "~/lib/cloudflare-context.server";
import type { Route } from "./+types/dashboard.review";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { items: [], submitted: [] };
  const orgId = session.session.activeOrganizationId!;
  if (!await hasActiveSubscription(orgId, session.user.id)) throw redirect("/dashboard/billing");

  const allControls = await db.select().from(control);
  const checks = await db.select().from(policyCheck).where(
    eq(policyCheck.organizationId, orgId),
  ).orderBy(desc(policyCheck.lastCheckedAt));

  const submittedRows = await db.select().from(manualEvidence).where(
    eq(manualEvidence.organizationId, orgId)
  ).orderBy(desc(manualEvidence.submittedAt));

  const checkIds = submittedRows.map((s) => s.policyCheckId).filter(Boolean) as string[];
  const originals = checkIds.length > 0
    ? await db.select().from(policyCheck).where(inArray(policyCheck.id, checkIds as any))
    : [];
  const originalById = new Map(originals.map((o) => [o.id, o]));

  const statusByControl: Record<string, typeof checks[0]> = {};
  for (const c of checks) {
    if (c.ruleId) statusByControl[c.ruleId] = c;
  }

  const items = allControls.map((ctrl) => {
    const pc = statusByControl[ctrl.controlId];
    return {
      control: ctrl,
      check: pc || null,
      status: pc?.status || "unchecked",
      detail: pc?.detail || null,
    };
  });

  const submitted = submittedRows
    .filter((row): row is typeof row & { policyCheckId: string } => !!row.policyCheckId && originalById.has(row.policyCheckId))
    .map((row) => {
      const finding = originalById.get(row.policyCheckId)!;
      return {
        ...row,
        originalFinding: finding,
        control: allControls.find((c) => c.controlId === finding.ruleId) || null,
      };
    });

  return { items, submitted };
}

export async function action({ request, context }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { ok: false };
  const orgId = session.session.activeOrganizationId!;
  if (!await hasActiveSubscription(orgId, session.user.id)) return { ok: false };

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "submit-evidence") {
    const content = formData.get("content") as string;
    const allNonPass = await db.select().from(policyCheck).where(
      and(eq(policyCheck.organizationId, orgId), ne(policyCheck.status, "pass")),
    );
    if (allNonPass.length === 0) return { ok: true };

    const cf = context.get(cloudflareContext)!;
    let fileTexts: { name: string; content: string }[] = [];
    const fileEntries = formData.getAll("file") as File[];
    let fileUrls: string[] = [];
    let fileNames: string[] = [];

    for (const file of fileEntries) {
      if (file.size > 0) {
        const key = `${orgId}/${crypto.randomUUID()}-${file.name}`;
        await cf.env.EVIDENCE_BUCKET.put(key, await file.bytes(), {
          httpMetadata: { contentType: file.type },
        });
        fileUrls.push(`https://evidence.${new URL(request.url).hostname}/${key}`);
        fileNames.push(file.name);
        try { fileTexts.push({ name: file.name, content: await file.text() }); } catch { /* binary */ }
      }
    }

    const combinedFileContent = fileTexts.map((f) => `--- ${f.name} ---\n${f.content}`).join("\n\n");
    const combinedFilename = fileNames.join(", ");
    const controlIds = allNonPass.map((c) => c.ruleId);

    const results = await batchReviewEvaluate(orgId, controlIds, content, combinedFileContent || null, combinedFilename || null);

    for (const [ruleId, r] of Object.entries(results)) {
      await db.update(policyCheck)
        .set({ status: r.status, detail: r.detail })
        .where(and(eq(policyCheck.ruleId, ruleId), eq(policyCheck.organizationId, orgId)));
    }

    await db.insert(manualEvidence).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      policyCheckId: allNonPass[0].id,
      category: "other",
      title: "org-evidence",
      content,
      fileUrl: fileUrls.join(",") || null,
      originalFilename: fileNames.join(",") || null,
      status: "pending",
      submittedAt: new Date(),
    });

    return { ok: true };
  }

  return { ok: false };
}

function extBadge(filename: string) {
  const ext = filename.includes(".") ? filename.split(".").pop()!.toUpperCase() : "FILE";
  const colours: Record<string, string> = {
    PDF: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
    PNG: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
    JPG: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
    GIF: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
    SVG: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    DOC: "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20",
    DOCX: "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20",
    TXT: "bg-[#6A6D6E]/10 text-[#6A6D6E] border-[#6A6D6E]/20",
    CSV: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
    JSON: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    MD: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
  };
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none ${colours[ext] || "bg-[#5C5C66]/10 text-[#5C5C66] border-[#5C5C66]/20"}`}>
      {ext}
    </span>
  );
}

const STATUS_FILTERS = [
  { key: "needs-attention", label: "Needs attention" },
  { key: "pass", label: "Passed" },
  { key: "all", label: "All" },
] as const;

export default function ReviewPage({ loaderData }: Route.ComponentProps) {
  const { items, submitted } = loaderData;
  const fetcher = useFetcher();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [evidenceText, setEvidenceText] = useState("");
  const [framework, setFramework] = useState<"soc2" | "ai-act">("soc2");
  const [statusFilter, setStatusFilter] = useState<string>("needs-attention");

  const frameworkItems = items.filter((it) => it.control.framework === framework);
  const filteredItems = statusFilter === "needs-attention"
    ? frameworkItems.filter((it) => it.status !== "pass" && it.status !== "unchecked")
    : statusFilter === "pass"
    ? frameworkItems.filter((it) => it.status === "pass" || it.status === "unchecked")
    : frameworkItems;

  const frameworkSubmitted = submitted.filter((s: any) => s.control?.framework === framework);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F1F1F3]">Review</h1>
          <p className="mt-1 text-sm text-[#6A6D6E]">{items.length} controls mapped</p>
        </div>
        <div className="flex items-center gap-3">
          {(["soc2", "ai-act"] as const).map((fw) => (
            <button key={fw} onClick={() => setFramework(fw)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                framework === fw ? "bg-[#00D4AA]/10 text-[#00D4AA]" : "text-[#5C5C66] hover:text-[#8B8B93]"
              }`}
            >{fw === "soc2" ? "SOC 2" : "EU AI Act"}</button>
          ))}
        </div>
      </div>

      {/* Org-level evidence section */}
      <div className="rounded-xl border border-[#1A1D1E] bg-[#0B0D0E] p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5C5C66] mb-3">Submit evidence</h2>
        <fetcher.Form method="POST" encType="multipart/form-data" className="space-y-3">
          <input type="hidden" name="intent" value="submit-evidence" />
          <textarea name="content" value={evidenceText} onChange={(e) => setEvidenceText(e.target.value)}
            rows={3} placeholder="Describe the evidence you have…"
            className="w-full rounded-lg border border-[#1A1D1E] bg-[#07080A] px-3 py-2.5 text-sm text-[#F1F1F3] placeholder-[#5C5C66] focus:border-[#00D4AA] focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/20 transition-all resize-y"
          />
          <div>
            {evidenceFiles.length > 0 ? (
              <div className="space-y-1.5">
                {evidenceFiles.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-lg border border-[#1A1D1E] bg-[#07080A] px-3 py-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#1A1D1E]">
                      <svg className="h-4 w-4 text-[#6A6D6E]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5l-4-4z"/><path d="M9 1v4h4"/></svg>
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-[#F1F1F3]">{f.name}</span>
                    {extBadge(f.name)}
                    <button type="button" onClick={() => setEvidenceFiles((p) => p.filter((_, j) => j !== i))}
                      className="shrink-0 rounded p-1 text-[#5C5C66] hover:bg-[#1A1D1E] hover:text-[#EF4444] transition-colors">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
                    </button>
                  </div>
                ))}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#1A1D1E] bg-[#07080A] px-3 py-2 text-sm text-[#5C5C66] hover:border-[#00D4AA]/30 hover:text-[#8B8B93] transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>
                  Add more files…
                  <input type="file" multiple className="hidden" onChange={(e) => {
                    const nf = Array.from(e.target.files || []);
                    if (nf.length > 0) setEvidenceFiles((p) => [...p, ...nf]);
                  }} />
                </label>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#1A1D1E] bg-[#07080A] px-3 py-2.5 text-sm text-[#5C5C66] hover:border-[#00D4AA]/30 hover:text-[#8B8B93] transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>
                Choose files…
                <input type="file" multiple className="hidden" onChange={(e) => {
                  const nf = Array.from(e.target.files || []);
                  if (nf.length > 0) setEvidenceFiles(nf);
                }} />
              </label>
            )}
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={fetcher.state !== "idle"}
              className="rounded-lg bg-[#00D4AA] px-5 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 disabled:opacity-50">
              {fetcher.state !== "idle" ? "Re-evaluating…" : "Submit & re-evaluate"}
            </button>
          </div>
        </fetcher.Form>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2">
        {STATUS_FILTERS.map((sf) => (
          <button key={sf.key} onClick={() => setStatusFilter(sf.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              statusFilter === sf.key ? "bg-[#141718] text-[#F1F1F3]" : "text-[#5C5C66] hover:text-[#8B8B93]"
            }`}
          >{sf.label}</button>
        ))}
      </div>

      <div className={`grid gap-6 ${frameworkSubmitted.length > 0 ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
        {/* Control cards — all controls */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5C5C66]">Controls</h2>
          {filteredItems.map(({ control: ctrl, check, status, detail }) => {
            const isOpen = expanded[ctrl.controlId] ?? false;
            const dot = status === "pass" ? "bg-[#00D4AA]"
              : status === "fail" ? "bg-[#EF4444]"
              : status === "warning" ? "bg-[#F59E0B]"
              : "bg-[#1A1D1E]";

            return (
              <div key={ctrl.id} className="overflow-hidden rounded-xl border border-[#1A1D1E] bg-[#0B0D0E] transition-all duration-200 hover:border-[#1C1C24]">
                <button onClick={() => setExpanded((prev) => ({ ...prev, [ctrl.controlId]: !isOpen }))}
                  className="flex w-full items-start gap-3 p-4 text-left">
                  <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-[#00D4AA]/10 px-2 py-0.5 font-mono text-xs text-[#00D4AA]">{ctrl.controlId}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                        status === "pass" ? "bg-[#00D4AA]/10 text-[#00D4AA]"
                        : status === "fail" ? "bg-[#EF4444]/10 text-[#EF4444]"
                        : status === "warning" ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                        : "bg-[#1A1D1E]/10 text-[#5C5C66]"
                      }`}>{status}</span>
                      <span className="text-xs font-medium text-[#F1F1F3]">{ctrl.title}</span>
                    </div>
                    {detail && (
                      <p className={`mt-1.5 text-sm leading-relaxed text-[#8B8B93] ${isOpen ? "" : "line-clamp-2"}`}>{detail}</p>
                    )}
                  </div>
                </button>
                {isOpen && detail && (
                  <div className="border-t border-[#1A1D1E] px-4 pb-4">
                    <p className="mt-3 text-sm leading-relaxed text-[#6A6D6E]">{detail}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submitted evidence history */}
        <div className="space-y-2">
          {frameworkSubmitted.length > 0 && (
            <>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#00D4AA]">Submitted ({frameworkSubmitted.length})</h2>
              {frameworkSubmitted.map((item: any) => (
                <div key={item.id} className="rounded-xl border border-[#1A1D1E] bg-[#0B0D0E] p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    {item.control && <span className="rounded bg-[#00D4AA]/10 px-2 py-0.5 font-mono text-xs text-[#00D4AA]">{item.control.controlId}</span>}
                    <span className="rounded bg-[#5C5C66]/10 px-2 py-0.5 font-mono text-xs text-[#5C5C66]">Evidence</span>
                  </div>
                  <p className="text-xs text-[#6A6D6E] leading-relaxed">{item.originalFinding?.detail}</p>
                  <div className="mt-2 rounded-lg border border-[#1A1D1E] bg-[#07080A] px-3 py-2">
                    <p className="text-sm text-[#F1F1F3]">{item.content}</p>
                  </div>
                  {item.fileUrl && item.originalFilename && (
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-2 rounded-lg border border-[#1A1D1E] bg-[#07080A] px-3 py-2 hover:border-[#00D4AA]/30 transition-colors">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#1A1D1E]">
                        <svg className="h-4 w-4 text-[#6A6D6E]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5l-4-4z"/><path d="M9 1v4h4"/></svg>
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-[#00D4AA] hover:underline">{item.originalFilename}</span>
                      {extBadge(item.originalFilename)}
                      <svg className="h-3 w-3 shrink-0 text-[#5C5C66]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2l5 5-5 5"/></svg>
                    </a>
                  )}
                  <p className="mt-2 text-[10px] text-[#5C5C66]">Submitted {new Date(item.submittedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
