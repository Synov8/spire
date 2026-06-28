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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Review</h1>

      {pending.length === 0 && submitted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#1C1C24] p-10 text-center">
          <p className="text-sm text-[#5C5C66]">Nothing needs your attention right now.</p>
        </div>
      ) : null}

      {pending.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">
            Needs review ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map(({ check, control: ctrl }) => (
              <div key={check.id} className="rounded-xl border border-[#F59E0B]/20 bg-[#111116] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {ctrl && <span className="font-mono text-xs text-[#00D4AA]">{ctrl.controlId}</span>}
                      <span className="text-xs rounded bg-[#F59E0B]/10 px-2 py-0.5 text-[#F59E0B]">needs input</span>
                    </div>
                    <h3 className="mt-1 font-medium text-[#F1F1F3]">{ctrl?.title || "Control review"}</h3>
                    <p className="mt-1 text-sm text-[#8B8B93]">{check.detail}</p>
                  </div>
                </div>
                <fetcher.Form method="POST" className="mt-4 flex items-end gap-3">
                  <input type="hidden" name="intent" value="submit-evidence" />
                  <input type="hidden" name="policyCheckId" value={check.id} />
                  <input type="hidden" name="category" value="other" />
                  <div className="flex-1">
                    <label className="mb-1 block text-xs uppercase tracking-wider text-[#5C5C66]">Your response</label>
                    <textarea name="title" rows={1} placeholder="Describe what you've done or upload details"
                      className="w-full rounded-lg border border-[#1C1C24] bg-[#0A0A0C] px-3 py-2 text-sm text-[#F1F1F3] placeholder-[#5C5C66] focus:border-[#00D4AA] focus:outline-none resize-none" />
                  </div>
                  <button type="submit" className="shrink-0 rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-colors">
                    Submit
                  </button>
                </fetcher.Form>
              </div>
            ))}
          </div>
        </section>
      )}

      {submitted.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#00D4AA]">Submitted evidence ({submitted.length})</h2>
          <div className="space-y-2">
            {submitted.map((item) => (
              <div key={item.id} className="rounded-lg border border-[#1C1C24] bg-[#111116] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#F1F1F3]">{item.title}</p>
                    <p className="text-xs text-[#5C5C66] capitalize">{item.category.replace("_", " ")}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    item.status === "approved" ? "bg-[#00D4AA]/10 text-[#00D4AA]"
                    : item.status === "rejected" ? "bg-[#EF4444]/10 text-[#EF4444]"
                    : "bg-[#F59E0B]/10 text-[#F59E0B]"
                  }`}>{item.status}</span>
                </div>
                {item.content && <p className="mt-2 text-sm text-[#8B8B93]">{item.content}</p>}
                <p className="mt-1 text-[10px] text-[#5C5C66]">Submitted {new Date(item.submittedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
