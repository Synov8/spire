import { useState } from "react";
import { useFetcher, redirect } from "react-router";
import { db } from "~/db";
import { policyCheck, control, manualEvidence } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { eq, and, desc, inArray, ne } from "drizzle-orm";
import { hasActiveSubscription } from "~/lib/subscription-check";
import { reviewEvaluate } from "~/agents/review-evaluate";
import type { Route } from "./+types/dashboard.review";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { items: [], submitted: [] };
  const orgId = session.session.activeOrganizationId!;
  if (!await hasActiveSubscription(orgId, session.user.id)) throw redirect("/dashboard/billing");

  const checks = await db.select().from(policyCheck).where(
    and(eq(policyCheck.organizationId, orgId), ne(policyCheck.status, "pass")),
  ).orderBy(desc(policyCheck.lastCheckedAt));

  const controls = await db.select().from(control);
  const submittedRows = await db.select().from(manualEvidence).where(
    eq(manualEvidence.organizationId, orgId)
  ).orderBy(desc(manualEvidence.submittedAt));

  const checkIds = submittedRows.map((s) => s.policyCheckId).filter(Boolean) as string[];
  const originals = checkIds.length > 0
    ? await db.select().from(policyCheck).where(inArray(policyCheck.id, checkIds as any))
    : [];
  const originalById = new Map(originals.map((o) => [o.id, o]));

  const items = checks.map((check) => {
    const ctrl = controls.find((c) => c.controlId === check.ruleId);
    return { check, control: ctrl || null };
  });

  const submitted = submittedRows
    .filter((row): row is typeof row & { policyCheckId: string } => !!row.policyCheckId && originalById.has(row.policyCheckId))
    .map((row) => {
      const finding = originalById.get(row.policyCheckId)!;
      return {
        ...row,
        originalFinding: finding,
        control: controls.find((c) => c.controlId === finding.ruleId) || null,
      };
    });

  return { items, submitted };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { ok: false };
  const orgId = session.session.activeOrganizationId!;
  if (!await hasActiveSubscription(orgId, session.user.id)) return { ok: false };

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "submit-evidence") {
    const policyCheckId = formData.get("policyCheckId") as string;
    const content = formData.get("content") as string;
    const fileUrl = formData.get("fileUrl") as string;
    const originalFilename = formData.get("originalFilename") as string;

    const original = await db.select().from(policyCheck).where(eq(policyCheck.id, policyCheckId)).limit(1).then((r) => r[0]);
    if (!original) return { ok: false };

    let fileContent: string | null = null;
    if (fileUrl && originalFilename) {
      try {
        const resp = await fetch(fileUrl);
        fileContent = await resp.text();
      } catch { /* non-text file, skip content extraction */ }
    }

    const result = await reviewEvaluate(orgId, original.ruleId, content, fileContent, originalFilename);

    await db.update(policyCheck)
      .set({ status: result.status, detail: result.detail })
      .where(eq(policyCheck.id, policyCheckId));

    await db.insert(manualEvidence).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      policyCheckId,
      category: "other",
      title: original.ruleId,
      content,
      fileUrl: fileUrl || null,
      originalFilename: originalFilename || null,
      status: "pending",
      submittedAt: new Date(),
    });

    return { ok: true };
  }

  return { ok: false };
}

export default function ReviewPage({ loaderData }: Route.ComponentProps) {
  const { items, submitted } = loaderData;
  const fetcher = useFetcher();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#F1F1F3]">Review</h1>
        <p className="mt-1 text-sm text-[#6A6D6E]">
          {items.length > 0
            ? `${items.length} control${items.length === 1 ? "" : "s"} need${items.length === 1 ? "s" : ""} attention`
            : "All controls are passing"}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#1A1D1E] bg-[#0B0D0E]/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1A1D1E] bg-[#141718]">
            <svg className="h-6 w-6 text-[#4A4D4E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
          </div>
          <p className="mt-4 text-sm font-medium text-[#8B8B93]">All clear</p>
          <p className="mt-1 text-xs text-[#5C5C66]">No controls need attention.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(({ check, control: ctrl }) => {
            const isOpen = expanded[check.id] ?? false;
            const statusColour = check.status === "fail" ? "bg-[#EF4444]"
              : check.status === "warning" ? "bg-[#F59E0B]"
              : "bg-[#6A6D6E]";

            return (
              <div key={check.id} className="overflow-hidden rounded-xl border border-[#1A1D1E] bg-[#0B0D0E] transition-all duration-200 hover:border-[#1C1C24]">
                <button onClick={() => setExpanded((prev) => ({ ...prev, [check.id]: !isOpen }))}
                  className="flex w-full items-start gap-3 p-4 text-left">
                  <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${statusColour}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {ctrl && <span className="rounded bg-[#00D4AA]/10 px-2 py-0.5 font-mono text-xs text-[#00D4AA]">{ctrl.controlId}</span>}
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                        check.status === "fail" ? "bg-[#EF4444]/10 text-[#EF4444]"
                        : check.status === "warning" ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                        : "bg-[#6A6D6E]/10 text-[#6A6D6E]"
                      }`}>
                        {check.status}
                      </span>
                      <span className="text-xs font-medium text-[#F1F1F3]">{ctrl?.title || "Unknown control"}</span>
                    </div>
                    <p className={`mt-1.5 text-sm leading-relaxed text-[#8B8B93] ${isOpen ? "" : "line-clamp-2"}`}>{check.detail}</p>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-[#1A1D1E] px-4 pb-4">
                    <div className="mt-4 space-y-3">
                      <label className="mb-1.5 block text-xs font-medium text-[#5C5C66]">Your response</label>
                      <textarea
                        id={`content-${check.id}`}
                        rows={4}
                        placeholder="Describe the evidence you have to address this finding…"
                        className="w-full rounded-lg border border-[#1A1D1E] bg-[#07080A] px-3 py-2.5 text-sm text-[#F1F1F3] placeholder-[#5C5C66] focus:border-[#00D4AA] focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/20 transition-all resize-y"
                      />
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#5C5C66]">Supporting file (optional)</label>
                        <input
                          id={`file-${check.id}`}
                          type="file"
                          className="w-full text-sm text-[#6A6D6E] file:mr-3 file:rounded-lg file:border-0 file:bg-[#1A1D1E] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#F1F1F3] hover:file:bg-[#2A2D2E]"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={async () => {
                            const fileInput = document.getElementById(`file-${check.id}`) as HTMLInputElement;
                            const textarea = document.getElementById(`content-${check.id}`) as HTMLTextAreaElement;

                            let fileUrl = "";
                            let originalFilename = "";
                            if (fileInput?.files?.[0]) {
                              const fd = new FormData();
                              fd.append("file", fileInput.files[0]);
                              const resp = await fetch("/api/upload-evidence", { method: "POST", body: fd });
                              const data = await resp.json() as { fileUrl: string; originalFilename: string };
                              fileUrl = data.fileUrl;
                              originalFilename = data.originalFilename;
                            }

                            const formData = new FormData();
                            formData.append("intent", "submit-evidence");
                            formData.append("policyCheckId", check.id);
                            formData.append("content", textarea?.value || "");
                            formData.append("fileUrl", fileUrl);
                            formData.append("originalFilename", originalFilename);
                            fetcher.submit(formData, { method: "POST" });
                          }}
                          disabled={fetcher.state !== "idle"}
                          className="rounded-lg bg-[#00D4AA] px-5 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 disabled:opacity-50"
                        >
                          {fetcher.state !== "idle" ? "Uploading…" : "Submit evidence"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {submitted.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#00D4AA]">Submitted ({submitted.length})</h2>
          <div className="space-y-2">
            {submitted.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-[#1A1D1E] bg-[#0B0D0E] p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  {item.control && <span className="rounded bg-[#00D4AA]/10 px-2 py-0.5 font-mono text-xs text-[#00D4AA]">{item.control.controlId}</span>}
                </div>
                <p className="text-xs text-[#6A6D6E] leading-relaxed">{item.originalFinding?.detail}</p>
                <div className="mt-2 rounded-lg border border-[#1A1D1E] bg-[#07080A] px-3 py-2">
                  <p className="text-sm text-[#F1F1F3]">{item.content}</p>
                </div>
                <p className="mt-2 text-[10px] text-[#5C5C66]">Submitted {new Date(item.submittedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
