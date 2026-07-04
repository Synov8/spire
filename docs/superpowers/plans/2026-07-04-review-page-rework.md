# Review Page Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the review page to show all non-pass policy checks, replace `needs-human-input` with `unknown`, add file uploads to R2, and add AI re-evaluation on evidence submit.

**Architecture:** Schema changes (drop needsReview, add file fields) flow through Drizzle. A new upload endpoint writes to Cloudflare R2. A new AI evaluation function re-assesses a single control using org context + user evidence. The review page becomes a single-column list with colour-coded badges.

**Tech Stack:** Drizzle ORM, Cloudflare R2, Vercel AI SDK (generateText, no tools), OpenRouter, Neon

## Global Constraints

- Model must be `deepseek/deepseek-v4-flash` with temperature 0
- All AI calls use OpenRouter via `@openrouter/ai-sdk-provider`
- R2 bucket name: `spire-evidence` (both prod and dev)
- Status values: `pass` | `fail` | `warning` | `unknown`
- No Composio tools in the re-evaluation call

---

### Task 1: Schema changes

**Files:**
- Modify: `app/agents/audit-schema.ts`
- Modify: `app/db/schema.ts`

**Interfaces:**
- Consumes: existing schema definitions
- Produces: updated `ControlVerdict.status` (now `"unknown"` not `"needs-human-input"`), updated `policyCheck` table (no `needsReview`), updated `manualEvidence` table (+ `fileUrl`, `originalFilename`)

- [ ] **Step 1: Update audit-schema.ts**

Change the Zod status enum:

```ts
// app/agents/audit-schema.ts
status: z.enum(["pass", "fail", "warning", "unknown"]),
```

Also update the `ControlVerdict` type if it's used anywhere else in the file.

- [ ] **Step 2: Update db/schema.ts**

Drop `needsReview` from `policyCheck`:

```ts
export const policyCheck = pgTable("policy_check", {
  id: text("id").primaryKey(),
  ruleId: text("rule_id").notNull(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  detail: text("detail"),
  lastCheckedAt: timestamp("last_checked_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

Add `fileUrl` and `originalFilename` to `manualEvidence`:

```ts
export const manualEvidence = pgTable("manual_evidence", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  policyCheckId: text("policy_check_id").references(() => policyCheck.id, { onDelete: "set null" }),
  category: text("category").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  fileUrl: text("file_url"),
  originalFilename: text("original_filename"),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});
```

- [ ] **Step 3: Generate Drizzle migration**

```bash
npx drizzle-kit generate
```

This will create a migration that drops the `needs_review` column and adds `file_url` + `original_filename`.

- [ ] **Step 4: Commit**

```bash
git add app/agents/audit-schema.ts app/db/schema.ts drizzle/
git commit -m "feat: update schema — drop needsReview, rename needs-human-input to unknown, add file fields"
```

---

### Task 2: Update trigger audit task

**Files:**
- Modify: `trigger/audit-task.ts`

**Interfaces:**
- Consumes: updated `ControlVerdict` type
- Produces: `policy_check` rows without `needs_review`, stores `unknown` status as-is

- [ ] **Step 1: Update the storeAuditReport function**

Remove the normalisation of `needs-human-input` → `warning`, remove `needs_review` from the INSERT:

```ts
async function storeAuditReport(orgId: string, report: any) {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    if (!report?.controls) {
      console.error("storeAuditReport: no controls in report", JSON.stringify(report).slice(0, 500));
      return;
    }
    // Remove stale policy checks and their orphaned manual evidence
    await sql`DELETE FROM manual_evidence WHERE policy_check_id IN (SELECT id FROM policy_check WHERE organization_id = ${orgId} AND (rule_id LIKE 'agent-audit%' OR rule_id = ANY(${Object.keys(report.controls)})))`;
    await sql`DELETE FROM policy_check WHERE organization_id = ${orgId} AND (rule_id LIKE 'agent-audit%' OR rule_id = ANY(${Object.keys(report.controls)}))`;
    for (const [controlId, v] of Object.entries(report.controls)) {
      const entry = v as any;
      await sql`
        INSERT INTO policy_check (id, rule_id, organization_id, status, detail, last_checked_at, created_at)
        VALUES (gen_random_uuid(), ${controlId}, ${orgId}, ${entry.status}, ${entry.detail + (entry.suggestedAction ? ` ${entry.suggestedAction}` : "")}, NOW(), NOW())
      `;
    }
  } catch (err) {
    console.error("storeAuditReport failed", err);
    throw err;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add trigger/audit-task.ts
git commit -m "feat: drop needs_review from audit task, stop normalising unknown"
```

---

### Task 3: Add R2 bucket binding

**Files:**
- Modify: `wrangler.jsonc`

- [ ] **Step 1: Add R2 bucket binding to wrangler.jsonc**

```jsonc
{
  // ... existing config ...
  "r2_buckets": [
    {
      "binding": "EVIDENCE_BUCKET",
      "bucket_name": "spire-evidence",
      "preview_bucket_name": "spire-evidence"
    }
  ]
}
```

- [ ] **Step 2: Add env type to worker-configuration.d.ts**

Regen types:
```bash
npm run cf-typegen
```

- [ ] **Step 3: Apply migration to dev DB**

```bash
npx drizzle-kit migrate
```

- [ ] **Step 4: Commit**

```bash
git add wrangler.jsonc worker-configuration.d.ts
git commit -m "feat: add R2 bucket binding for evidence uploads"
```

---

### Task 4: Create R2 upload endpoint

**Files:**
- Create: `app/routes/api/upload-evidence.ts`

**Interfaces:**
- Consumes: file via multipart form data, `EVIDENCE_BUCKET` R2 binding from env
- Produces: `POST /api/upload-evidence` returning `{ fileUrl: string, originalFilename: string }`

- [ ] **Step 1: Create the upload endpoint**

```ts
import type { Route } from "./+types/api.upload-evidence";
import { auth } from "~/lib/auth.server";

export async function action({ request, context }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  const env = process.env as unknown as { EVIDENCE_BUCKET: R2Bucket };
  const key = `${session.session.activeOrganizationId}/${crypto.randomUUID()}-${file.name}`;

  await env.EVIDENCE_BUCKET.put(key, await file.bytes(), {
    httpMetadata: { contentType: file.type },
  });

  const publicUrl = `https://evidence.${new URL(request.url).hostname}/${key}`;

  return Response.json({ fileUrl: publicUrl, originalFilename: file.name });
}
```

Note: The R2 bucket binding comes through `context.cloudflare.env` in React Router. Need to adjust for how bindings are accessed. If bindings come through `process.env` on Workers, use that. If through loader/action context args, adjust accordingly.

- [ ] **Step 2: Commit**

```bash
git add app/routes/api/upload-evidence.ts
git commit -m "feat: add evidence file upload endpoint"
```

---

### Task 5: Create AI re-evaluation function

**Files:**
- Create: `app/agents/review-evaluate.ts`

**Interfaces:**
- Consumes: `orgId: string`, `controlId: string`, `userText: string`, `fileContent: string | null`, `filename: string | null`
- Produces: `{ status: "pass" | "fail" | "warning" | "unknown", detail: string }`

- [ ] **Step 1: Create the re-evaluation function**

```ts
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { db } from "~/db";
import { policyCheck, control } from "~/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY || "" });

const model = openrouter.chat("deepseek/deepseek-v4-flash", {
  temperature: 0,
  reasoning: { effort: "xhigh" },
});

const EvaluationSchema = z.object({
  status: z.enum(["pass", "fail", "warning", "unknown"]),
  detail: z.string(),
});

export async function reviewEvaluate(
  orgId: string,
  controlId: string,
  userText: string,
  fileContent: string | null,
  filename: string | null,
) {
  const allChecks = await db.select().from(policyCheck).where(eq(policyCheck.organizationId, orgId));
  const ctrl = await db.select().from(control).where(eq(control.controlId, controlId)).limit(1).then((r) => r[0]);
  if (!ctrl) throw new Error(`Control ${controlId} not found`);

  const checksContext = allChecks
    .map((c) => `${c.ruleId}: ${c.status} — ${c.detail || "no detail"}`)
    .join("\n");

  let evidenceBlock = `User's response: ${userText}`;
  if (fileContent) {
    evidenceBlock += `\n\n--- ${filename} ---\n${fileContent}`;
  }

  const { output } = await generateText({
    model,
    schema: EvaluationSchema,
    prompt: [
      `You are evaluating a compliance control after a user has submitted evidence.`,
      ``,
      `Org's current compliance posture (all controls):`,
      checksContext,
      ``,
      `Control being re-evaluated: ${ctrl.controlId} (${ctrl.category}) — ${ctrl.title}`,
      ctrl.description,
      ``,
      `Evidence provided by the user:`,
      evidenceBlock,
      ``,
      `Re-evaluate this control based on the evidence. Return a status and updated detail.`,
    ].join("\n"),
  });

  return output;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/agents/review-evaluate.ts
git commit -m "feat: add AI re-evaluation function for single control review"
```

---

### Task 6: Rework review page

**Files:**
- Modify: `app/routes/dashboard.review.tsx`

**Interfaces:**
- Consumes: `reviewEvaluate()` from Task 5, `/api/upload-evidence` from Task 4
- Produces: Single-column review page with colour-coded badges, file upload, AI re-evaluation

- [ ] **Step 1: Rewrite the loader**

Remove `needsReview` filter — fetch all non-pass policy checks:

```ts
export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { items: [] };
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
```

Need to add `ne` import from `drizzle-orm`.

- [ ] **Step 2: Rewrite the action handler**

Add AI re-evaluation on evidence submit:

```ts
export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { ok: false };
  const orgId = session.session.activeOrganizationId!;

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "submit-evidence") {
    const policyCheckId = formData.get("policyCheckId") as string;
    const content = formData.get("content") as string;
    const fileUrl = formData.get("fileUrl") as string;
    const originalFilename = formData.get("originalFilename") as string;

    // Get the original policy check to find the controlId
    const original = await db.select().from(policyCheck).where(eq(policyCheck.id, policyCheckId)).limit(1).then((r) => r[0]);
    if (!original) return { ok: false };

    // Run AI re-evaluation
    let fileContent: string | null = null;
    if (fileUrl && originalFilename) {
      // For simplicity, fetch file content from the R2 URL
      try {
        const resp = await fetch(fileUrl);
        fileContent = await resp.text();
      } catch { /* non-text file, skip content extraction */ }
    }

    const result = await reviewEvaluate(orgId, original.ruleId, content, fileContent, originalFilename);

    // Update the policy check with the new verdict
    await db.update(policyCheck)
      .set({ status: result.status, detail: result.detail })
      .where(eq(policyCheck.id, policyCheckId));

    // Insert evidence record
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
```

- [ ] **Step 3: Rewrite the page component**

Single column, colour-coded badges, file upload + AI:

```tsx
export default function ReviewPage({ loaderData }: Route.ComponentProps) {
  const { items, submitted } = loaderData;
  const fetcher = useFetcher();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  // Combine pending items and submitted items into one list
  const allItems = items.map((item) => ({ ...item, key: "pending" as const }));

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
                            setUploading((prev) => ({ ...prev, [check.id]: true }));

                            let fileUrl = "";
                            let originalFilename = "";
                            if (fileInput?.files?.[0]) {
                              const fd = new FormData();
                              fd.append("file", fileInput.files[0]);
                              const resp = await fetch("/api/upload-evidence", { method: "POST", body: fd });
                              const data = await resp.json();
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
                          disabled={uploading[check.id]}
                          className="rounded-lg bg-[#00D4AA] px-5 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-all duration-200 disabled:opacity-50"
                        >
                          {uploading[check.id] ? "Uploading…" : "Submit evidence"}
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

      {/* Submitted section — same as before */}
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
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/dashboard.review.tsx
git commit -m "feat: rework review page — single column, coloured badges, file upload, AI re-eval"
```

---

### Task 7: Cleanup legacy files

**Files:**
- Delete: `app/agents/compliance-agent.ts`
- Delete: `app/agents/compliance-runner.ts`
- Modify: `scripts/self-audit.ts`

- [ ] **Step 1: Remove legacy agent files**

```bash
rm app/agents/compliance-agent.ts app/agents/compliance-runner.ts
```

- [ ] **Step 2: Update self-audit script**

Check `scripts/self-audit.ts` for any imports of `compliance-agent` or `compliance-runner` and remove them. If the script uses `storeAuditReport` or `runComplianceAudit`, update it to use the trigger task path instead or remove those calls.

- [ ] **Step 3: Commit**

```bash
git add app/agents/compliance-agent.ts app/agents/compliance-runner.ts scripts/self-audit.ts
git commit -m "chore: remove legacy compliance agent files"
```
