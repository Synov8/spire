import { useLoaderData, useFetcher, redirect } from "react-router";
import { db } from "~/db";
import { policyCheck, control, manualEvidence } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { eq, and, desc } from "drizzle-orm";
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
  const submitted = await db.select().from(manualEvidence).where(eq(manualEvidence.organizationId, orgId)).orderBy(desc(manualEvidence.submittedAt));

  const pending = checks.map((check) => {
    const ctrl = controls.find((c) => c.id === check.ruleId.replace("agent-", ""));
    return { check, control: ctrl || null };
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

  const submittedStatus: Record<string, { dot: string; badge: string }> = {
    approved: { dot: "bg-[#00D4AA]", badge: "bg-[#00D4AA]/10 text-[#00D4AA]" },
    rejected: { dot: "bg-[#EF4444]", badge: "bg-[#EF4444]/10 text-[#EF4444]" },
    pending: { dot: "bg-[#F59E0B]", badge: "bg-[#F59E0B]/10 text-[#F59E0B]" },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Review</h1>
        <p className="mt-1 text-sm text-[#6A6D6E]">Items that need your attention or have been submitted</p>
      </div>

      {pending.length === 0 && submitted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#1A1D1E] bg-[#0B0D0E]/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1A1D1E] bg-[#141718]">
            <svg className="h-6 w-6 text-[#4A4D4E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
          </div>
          <p className="mt-4 text-sm font-medium text-[#8B8B93]">All clear</p>
          <p className="mt-1 text-xs text-[#5C5C66]">Nothing needs your attention right now.</p>
        </div>
      ) : null}

      {pending.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#F59E0B]/15">
              <svg className="h-3 w-3 text-[#F59E0B]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v6M8 12v.5"/><circle cx="8" cy="8" r="6"/></svg>
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">
              Needs review ({pending.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pending.map(({ check, control: ctrl }) => (
              <div key={check.id} className="overflow-hidden rounded-2xl border border-[#F59E0B]/20 bg-[#0B0D0E]">
                <div className="border-l-2 border-[#F59E0B] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {ctrl && <span className="rounded bg-[#00D4AA]/10 px-2 py-0.5 font-mono text-xs text-[#00D4AA]">{ctrl.controlId}</span>}
                        <span className="text-xs rounded bg-[#F59E0B]/10 px-2 py-0.5 text-[#F59E0B]">needs input</span>
                      </div>
                      <h3 className="mt-2 font-medium text-[#F1F1F3]">{ctrl?.title || "Control review"}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#8B8B93]">{check.detail}</p>
                    </div>
                  </div>
                  <fetcher.Form method="POST" className="mt-4 flex items-end gap-3">
                    <input type="hidden" name="intent" value="submit-evidence" />
                    <input type="hidden" name="policyCheckId" value={check.id} />
                    <input type="hidden" name="category" value="other" />
                    <div className="flex-1">
                      <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#5C5C66]">Your response</label>
                      <textarea name="title" rows={1} placeholder="Describe what you've done or upload details"
                        className="w-full rounded-lg border border-[#1A1D1E] bg-[#07080A] px-3 py-2 text-sm text-[#F1F1F3] placeholder-[#5C5C66] focus:border-[#00D4AA] focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/20 transition-all resize-none" />
                    </div>
                    <button type="submit" className="shrink-0 rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 shadow-[0_2px_12px_-2px_rgba(0,212,170,0.3)]">
                      Submit
                    </button>
                  </fetcher.Form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {submitted.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#00D4AA]/15">
              <svg className="h-3 w-3 text-[#00D4AA]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#00D4AA]">Submitted evidence ({submitted.length})</h2>
          </div>
          <div className="space-y-2">
            {submitted.map((item) => {
              const cfg = submittedStatus[item.status] ?? { dot: "bg-[#5C5C66]", badge: "bg-[#1A1D1E] text-[#5C5C66]" };
              return (
                <div key={item.id} className="rounded-xl border border-[#1A1D1E] bg-[#0B0D0E] p-4 transition-all duration-200 hover:border-[#1C1C24]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#F1F1F3]">{item.title}</p>
                      <p className="mt-0.5 text-xs text-[#5C5C66] capitalize">{item.category.replace("_", " ")}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {item.status}
                    </span>
                  </div>
                  {item.content && <p className="mt-2 text-sm leading-relaxed text-[#8B8B93]">{item.content}</p>}
                  <p className="mt-2 flex items-center gap-1 text-[10px] text-[#5C5C66]">
                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg>
                    Submitted {new Date(item.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
