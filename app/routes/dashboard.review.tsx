import { useState } from "react";
import { useLoaderData, useFetcher, redirect } from "react-router";
import { db } from "~/db";
import { policyCheck, control, manualEvidence } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { eq, and, desc, inArray } from "drizzle-orm";
import { hasActiveSubscription } from "~/lib/subscription-check";
import type { Route } from "./+types/dashboard.review";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { pending: [], submitted: [] };
  const orgId = session.session.activeOrganizationId!;
  if (!await hasActiveSubscription(orgId, session.user.id)) throw redirect("/dashboard/billing");

  const checks = await db.select().from(policyCheck).where(
    and(eq(policyCheck.organizationId, orgId), eq(policyCheck.needsReview, true)),
  ).orderBy(desc(policyCheck.lastCheckedAt));

  const controls = await db.select().from(control);
  const submittedRows = await db.select().from(manualEvidence).where(eq(manualEvidence.organizationId, orgId)).orderBy(desc(manualEvidence.submittedAt));

  // For submitted items, only keep those with a still-existing original finding
  const checkIds = submittedRows.map((s) => s.policyCheckId).filter(Boolean) as string[];
  const originals = checkIds.length > 0
    ? await db.select().from(policyCheck).where(inArray(policyCheck.id, checkIds as any))
    : [];
  const originalById = new Map(originals.map((o) => [o.id, o]));

  const pending = checks.map((check) => {
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

  return { pending, submitted };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { ok: false };
  const orgId = session.session.activeOrganizationId!;

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "submit-evidence") {
    const category = formData.get("category") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const policyCheckId = formData.get("policyCheckId") as string;

    await db.insert(manualEvidence).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      policyCheckId,
      category, title, content, status: "pending", submittedAt: new Date(),
    });

    if (policyCheckId) {
      await db.update(policyCheck).set({ needsReview: false }).where(eq(policyCheck.id, policyCheckId));
    }

    return { ok: true };
  }

  return { ok: false };
}

export default function ReviewPage({ loaderData }: Route.ComponentProps) {
  const { pending, submitted } = loaderData;
  const fetcher = useFetcher();
  const [expandedPending, setExpandedPending] = useState<Record<string, boolean>>({});
  const [expandedSubmitted, setExpandedSubmitted] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#F1F1F3]">Review</h1>
        <p className="mt-1 text-sm text-[#6A6D6E]">Respond to audit findings and track submitted evidence</p>
      </div>

      {pending.length === 0 && submitted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#1A1D1E] bg-[#0B0D0E]/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1A1D1E] bg-[#141718]">
            <svg className="h-6 w-6 text-[#4A4D4E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
          </div>
          <p className="mt-4 text-sm font-medium text-[#8B8B93]">All clear</p>
          <p className="mt-1 text-xs text-[#5C5C66]">No audit findings need your input.</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${submitted.length > 0 ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>

          {/* Pending review */}
          {pending.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#F59E0B]/15">
                  <svg className="h-3 w-3 text-[#F59E0B]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v6M8 12v.5"/><circle cx="8" cy="8" r="6"/></svg>
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
                  Needs review ({pending.length})
                </h2>
              </div>
              <div className="space-y-2">
                {pending.map(({ check, control: ctrl }) => {
                  const isOpen = expandedPending[check.id] ?? false;
                  return (
                    <div key={check.id} className="overflow-hidden rounded-xl border border-[#1A1D1E] bg-[#0B0D0E] transition-all duration-200 hover:border-[#1C1C24]">
                      <button onClick={() => setExpandedPending((prev) => ({ ...prev, [check.id]: !isOpen }))} className="flex w-full items-start gap-3 p-4 text-left">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-transform duration-200 ${isOpen ? "rotate-90" : ""} bg-[#F59E0B]/15 text-[#F59E0B]`}>
                          <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4l4 4-4 4"/></svg>
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {ctrl && <span className="rounded bg-[#00D4AA]/10 px-2 py-0.5 font-mono text-xs text-[#00D4AA]">{ctrl.controlId}</span>}
                            <span className={`text-xs font-medium ${ctrl ? "text-[#F1F1F3]" : "text-[#6A6D6E]"}`}>{ctrl?.title || "Audit finding"}</span>
                          </div>
                          <p className={`mt-1.5 text-sm leading-relaxed text-[#8B8B93] ${isOpen ? "" : "line-clamp-2"}`}>{check.detail}</p>
                        </div>
                      </button>
                      {isOpen && (
                        <div className="border-t border-[#1A1D1E] px-4 pb-4">
                          <fetcher.Form method="POST" className="mt-4">
                            <input type="hidden" name="intent" value="submit-evidence" />
                            <input type="hidden" name="policyCheckId" value={check.id} />
                            <input type="hidden" name="category" value="other" />
                            <input type="hidden" name="title" value={ctrl?.controlId || "audit-finding"} />
                            <label className="mb-1.5 block text-xs font-medium text-[#5C5C66]">Your response</label>
                            <textarea name="content" rows={4} placeholder="Describe what you've done to address this finding…"
                              className="w-full rounded-lg border border-[#1A1D1E] bg-[#07080A] px-3 py-2.5 text-sm text-[#F1F1F3] placeholder-[#5C5C66] focus:border-[#00D4AA] focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/20 transition-all resize-y" />
                            <div className="mt-3 flex justify-end">
                              <button type="submit" className="rounded-lg bg-[#00D4AA] px-5 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">
                                Submit evidence
                              </button>
                            </div>
                          </fetcher.Form>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Submitted evidence */}
          {submitted.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#00D4AA]/15">
                  <svg className="h-3 w-3 text-[#00D4AA]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#00D4AA]">Submitted ({submitted.length})</h2>
              </div>
              <div className="space-y-2">
                  {submitted.map((item: any) => {
                  const isOpen = expandedSubmitted[item.id] ?? false;
                  return (
                    <div key={item.id} className="overflow-hidden rounded-xl border border-[#1A1D1E] bg-[#0B0D0E] transition-all duration-200 hover:border-[#1C1C24]">
                      <button onClick={() => setExpandedSubmitted((prev) => ({ ...prev, [item.id]: !isOpen }))} className="flex w-full items-start gap-3 p-4 text-left">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-transform duration-200 ${isOpen ? "rotate-90" : ""} bg-[#00D4AA]/15 text-[#00D4AA]`}>
                          <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4l4 4-4 4"/></svg>
                        </span>
                        <div className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1.5">
                            {item.control && <span className="rounded bg-[#00D4AA]/10 px-2 py-0.5 font-mono text-xs text-[#00D4AA]">{item.control.controlId}</span>}
                          </div>
                          {item.originalFinding && (
                            <p className={`text-xs text-[#6A6D6E] leading-relaxed ${isOpen ? "" : "line-clamp-1"}`}>{item.originalFinding.detail}</p>
                          )}
                          {(item.content || item.title) && (
                            <div className="mt-2 rounded-lg border border-[#1A1D1E] bg-[#07080A] px-3 py-2">
                              <p className="text-sm text-[#F1F1F3]">{item.content || item.title}</p>
                            </div>
                          )}
                          <p className="mt-2 flex items-center gap-1 text-[10px] text-[#5C5C66]">
                            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg>
                            Submitted {new Date(item.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
