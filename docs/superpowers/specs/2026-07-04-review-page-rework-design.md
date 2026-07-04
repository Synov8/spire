# Review Page Rework

## Status values

`pass` | `fail` | `warning` | `unknown`

Replaces the old `"needs-human-input"` with `"unknown"` (shorter, clearer). No normalisation — `unknown` stored as-is.

## Schema changes

**`policy_check`** — drop `needs_review` column. All non-pass statuses implicitly need attention.

**`manual_evidence`** — add `file_url text` and `original_filename text` for R2 uploads.

## Audit task (`trigger/audit-task.ts`)

- Store `unknown` status as-is (stop normalising to `warning`)
- Drop `needs_review` from INSERT
- Keep orphaned `manual_evidence` cleanup (added earlier)

## Review page

- Single-column list of all non-pass items, sorted by `last_checked_at` desc
- Each card: status indicator + control badge + status badge + detail text + expand/collapse
- Status badges: red = fail, orange = warning, grey = unknown
- Expanded area: text response field + file upload input + submit button
- File upload shows filename after successful upload

## File upload — R2

- Cloudflare R2 bucket bound as `EVIDENCE_BUCKET`
- Bucket names: `spire-evidence` (prod), `spire-evidence-dev` (dev)
- Upload endpoint: `POST /api/upload-evidence` — accepts multipart form data, writes to R2, returns JSON with URL + filename
- Frontend uploads file via fetch to this endpoint before form submit, stores returned URL in hidden input

## Evidence submit → AI re-evaluation

### Upload flow (frontend)

1. User types text + selects file
2. Clicks submit
3. Frontend uploads file to `/api/upload-evidence` via `fetch`, gets back `{ fileUrl, originalFilename }`
4. Fetcher submits form with hidden fields: text, `fileUrl`, `originalFilename`, `policyCheckId`
5. Action handler runs AI re-evaluation synchronously
6. On completion, UI updates (card moves from pending to somewhere visible, or re-renders with new status)

### AI re-evaluation (action handler)

- Sync call in the form action
- Gather: all org's current `policy_check` rows + the specific `control` definition + user's submitted text + extracted file content
- `generateText` (OpenRouter `deepseek/deepseek-v4-flash`, no Composio tools):
  - Prompt includes: org compliance posture (all current policy_check rows with status + detail), the specific control being re-evaluated, the user's submitted evidence text, and extracted file content (prefixed with `--- {filename} ---` if a file was uploaded)
  - Returns structured output: `{ status: "pass" | "fail" | "warning" | "unknown", detail: string }`
- Update the `policy_check` row with new status + detail
- Insert `manual_evidence` row with text + file content dump + fileUrl + originalFilename as a record
- The card moves from "pending" to a resolved state (or disappears from the review list depending on the new status)

## Cleanup

- Delete `app/agents/compliance-agent.ts`
- Delete `app/agents/compliance-runner.ts`
- Update `scripts/self-audit.ts` if it imports from either
- Update `app/agents/audit-schema.ts`: change `"needs-human-input"` to `"unknown"` in Zod enum

## Files to touch

| File | Change |
|------|--------|
| `app/agents/audit-schema.ts` | rename needs-human-input → unknown |
| `app/db/schema.ts` | drop needsReview from policyCheck, add file_url + original_filename to manualEvidence |
| `trigger/audit-task.ts` | drop needs_review writes, stop normalising unknown |
| `app/routes/dashboard.review.tsx` | full rework: single column, badges, file upload, AI re-eval |
| `wrangler.jsonc` | add R2 bucket binding |
| `worker-configuration.d.ts` | regen after binding change |
| `app/routes/api/upload-evidence.ts` | new — R2 upload endpoint |
| `app/agents/review-evaluate.ts` | new — AI re-evaluation for single control |
| `scripts/self-audit.ts` | remove imports from deleted files |
| `app/agents/compliance-agent.ts` | delete |
| `app/agents/compliance-runner.ts` | delete |
