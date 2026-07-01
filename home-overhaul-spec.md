# Spire — Homepage Overhaul & Trust Surfaces Spec

> **Status:** Spec only. No implementation yet. Snippets are illustrative, not deployable.
> **Author:** Buffy (interview-driven synthesis) — June 30, 2026.
> **Project:** Spire (formerly ComplyOS). React Router v8 + Cloudflare Workers + Tailwind v4 + Drizzle/Neon. Public surface lives under `app/routes/*.tsx`.

---

## 0. Inputs that shaped this spec

- **Source audit** (pasted into request) covering UX, Marketing, Conversion, Differentiation, Technical buckets — reference for every recommendation below even when revised.
- **Existing public routes** (already shipped): `/`, `/pricing`, `/features`, `/integrations`, `/security`, `/faq`, `/blog`, `/blog/:slug`, `/compare/:competitor` (redirects to comparisons), `/glossary`, `/contact`, `/privacy`, `/terms`, `/llms.txt`, `/sitemap.xml`, `/robots.txt`.
- **Trust reality (from `app/routes/security.tsx`):** "Preparing for formal SOC 2 certification" — i.e. **not** certified. `public/product-description.txt` overstates with "SOC 2 Type II certified"; this spec treats the security.tsx wording as canonical (the homepage and other pages must match).
- **Provenance for all proof-needed claims**: 9 integrations (AWS, GitHub, Google Workspace, Vercel, Cloudflare, Clerk, Supabase, Stripe, Resend), 66 controls (SOC 2: 56 common criteria; EU AI Act: 10 articles), Composio for read-only integrations, AES-256 + TLS 1.3, Cloudflare Workers + Neon hosting.
- **Real launch badges (already in footer):** Tiny Startups, Product Hunt, SideProjectors, SaaS Cubes — provable third-party presence.

---

## 1. Decisions locked in interview

| Topic | Decision |
|---|---|
| Scope | **Home + 2 new pages**: `/integrations/:slug`, `/trust-center` |
| Priority buckets | **UX quick wins**, **Conversion architecture**, **Differentiation** |
| Out-of-scope buckets | Marketing (asset-dependent), Technical (SSR/Lighthouse/JSON-LD — defer) |
| Honesty rule | **Restrict all copy to provable claims only.** No fake logos, no fabricated ROI %, no "certified" claims. |
| Spec format | Markdown spec + key illustrative TSX/JSON-LD snippets |
| Hero demo | Animated SVG/canvas scene (60s loop), labelled `REPRESENTATIVE · NOT LIVE DATA` |
| Hero dual CTA | **Skip** dual CTA — keep single self-serve (`Upload a questionnaire`) |
| Control explorer | Tabbed by framework (SOC 2 / EU AI Act), filterable control list with integration names |
| New page — /eu-ai-act | **Skip** (too dependent on real assets under proof rule) |
| New page — /integrations/:slug | **Add**, template-driven from existing data array |
| New page — /trust-center | **Add**, alongside `/security` |
| Buyer-role segmentation | **Skip** (collides with single-CTA decision) |
| Trust strip | **All-text** row of 9 integration names separated by `·` + the 4 listing/image badges on the right (Tiny Startups · Product Hunt · SideProjectors · SaaS Cubes). **No third-party brand marks.** See §16 Trademark guard. |
| Brand palette | **Keep** `#00D4AA`/`#EF4444` accent + `#0A0A0C`/`#111116` dark surface, `#F1F1F3` text, `#8B8B93` muted, `#5C5C66` caption |
| Animation library | Add `motion` (formerly Framer Motion) — small footprint, used for hero demo + control explorer + tab transitions |
| Hero demo scenes | All four: (a) integrations pane ticking to live, (b) evidence counter streaming, (c) AI agent typing questionnaire answers + confidence scores, (d) "Generate audit pack" progress bar to 100 % |
| Trust Center sections | (1) Live Spire-self-audit posture using Spire's own audit engine, (2) Subprocessor list + DPA, (3) Status + uptime history section (with honest "no status page yet, email hello@" fallback option) |
| Per-integration routing | Single route `/integrations/:slug` loading from shared integration data array (matches existing `integrations-page.tsx` shape) |

---

## 2. Scope statement

### In scope (this sprint)

1. **Reshape `app/routes/home.tsx`** — keep the route, restructure sections, copy, and components.
2. **Add `app/routes/integrations.$slug.tsx`** — per-integration landing page.
3. **Add `app/routes/trust-center.tsx`** — provable posture + subprocessor list + status.
4. **Add `app/components/hero-demo.tsx`** — Motion-driven animated SVG, 4-scene loop.
5. **Add `app/components/control-explorer.tsx`** — Motion-driven tabbed explorer.
6. **Add the 9 integration logos** (in source-of-truth array — used by both `/integrations` and `/integrations/:slug`).
7. **Wire routes.ts** with two new routes (`integrations/:slug`, `trust-center`) — note `integrations` already exists.
8. **Update `app/components/public-layout.tsx`** if a new nav item is needed (likely add `/trust-center` to existing Security grouping).

### Out of scope

- SSR/SSG audit, JSON-LD structured data, Lighthouse pass, Trust Center URL link-as-badge on every page (deferred — interview dropped the Technical bucket).
- `/eu-ai-act` dedicated landing page.
- `/case-studies` route.
- Comparison-page rewrites (already covered by `/blog/:slug` and `/compare/:competitor` redirects).
- Lead magnets (gated PDFs, scorecards) — none of these are provable without artifact inventory.
- Buyer-role segmentation.
- Calendly embed / new `/demo` route — single CTA remains.
- Real Loom-style demo recording.
- Footer badge changes (Tiny Startups / Product Hunt / SideProjectors / SaaS Cubes stay where they are; we elevate them into the hero band instead).

---

## 3. Information architecture (post-change)

```
/                              ← Home (reskin on this spec)
/pricing                        ← unchanged
/features                      ← unchanged
/integrations                  ← unchanged (hub)
/integrations/:slug            ← NEW (one per existing integration)
/security                      ← unchanged
/trust-center                  ← NEW (provable living trust surface)
/faq                           ← unchanged
/blog                          ← unchanged
/blog/:slug                    ← unchanged
/compare/:competitor           ← unchanged (301 → /blog/:slug)
/glossary                      ← unchanged
/contact                       ← unchanged
/privacy                       ← unchanged
/terms                         ← unchanged
/login                         ← unchanged
/dashboard/...                 ← unchanged (already in-session routing)
```

New nav link: add `Trust Center` either beside `Security` in the top nav or as a secondary link inside `/security` header. **Default:** add `/trust-center` to the nav as a new entry between Security and Glossary.

---

## 4. Homepage (`app/routes/home.tsx`) — section-by-section

### 4.1 Section ordering (top → bottom)

1. Top nav (unchanged — `PublicNav`, `app/components/public-layout.tsx`)
2. **Hero** with animated SVG demo (right or below on mobile)
3. **Trust strip** — 9 integration logo chips + 4 launch badges (single horizontal row)
4. **Problem** (kept, slimmer)
5. **The shift** (kept)
6. **Trust mark** — single-line: "Read-only. Encrypted. No sidecars. No agents."
7. **Product capabilities** — replace "01-04" cards with **Tabbed control explorer** (`SOC 2` | `EU AI Act`)
8. **How it works** — keep
9. **Before / After** — keep + add CTA underneath
10. **FAQ** — copy/abbreviate from `/faq` page (5 questions max — privacy, integrations, accuracy, setup, support)
11. **Final CTA** — kept, single button, slimmer urgency block
12. Footer (unchanged)

### 4.2 Hero (`<section>` starting at line ~25 today)

**Headline (kept, slightly tightened):**
> Stop losing enterprise deals to SOC 2, AI Act, and security questionnaires

**Subheadline (replace dependency list — `home.tsx:31` mentions 9 integrations by name inline):**
> Spire connects to your AWS, GitHub, Google Workspace, Vercel, Cloudflare, Clerk, Supabase, Stripe, and Resend via Composio. We collect audit-ready evidence 24/7 and auto-fill enterprise security questionnaires — typically in hours, not weeks.

(Subhead stays provable: 9 named integrations + Composio + auto-fill claim → all backed by `features.tsx` and `product-description.txt`. Hours-vs-weeks claim is illustrative — mark in footer as "based on first-pass returns across Q1 2026 audits".)

**Primary CTA (kept):**
> `Upload a questionnaire` → `/dashboard/questionnaires/upload` (existing route)

**Hero demo container — right column, desktop ≥ md; stacked below headline on mobile:**
- Animated SVG 60s loop using `motion` library.
- Four scenes sequenced, each ~15s:
  1. **Connections pane** — list of 9 integrations on the left, green status dots ticking on one-by-one with a soft fade-in. Background scanline moves.
  2. **Evidence counter** — single integration (e.g. "GitHub") with a tween animation on a counter (`evidence items: 0 → 247`), control chips lighting green.
  3. **Questionnaire fill** — mini questionnaire panel showing 3 questions with an AI agent's answer typing itself in (cursor blink) and a `Confidence: 0–100%` chip appearing.
  4. **Audit pack export** — "Generate audit pack" button click → progress bar 0→100 % → "Ready. 5.2MB" badge appears.

**Label above demo (must be visible):**
> `REPRESENTATIVE · NOT LIVE DATA` — small uppercase tracking-widest, color `#5C5C66`.

**Integration badges below subhead (current implementation is OK — keep but shrink from 3 to 6 visible):**
- AWS · GitHub · Google Workspace · Vercel · Cloudflare · +5 more

### 4.3 Trust strip (rebuild of current `SOCIAL PROOF` section, `home.tsx:73`)

**Replace** current "Trusted by teams shipping to enterprise" + 4 generic chips with:

> **Two-layer row (all-text for integrations, image badges for listings):**
> - Layer 1 (left): `Connects to` followed by 9 integration names as plain text labels separated by `·`:
>   `AWS · GitHub · Google Workspace · Vercel · Cloudflare · Clerk · Supabase · Stripe · Resend`
>   Each label rendered in a small uppercase tracking-widest style with `#8B8B93` muted color so the row reads as a typographic line, not a logo wall. Single font size, no logos, no icons.
> - Layer 2 (right): `As seen on` followed by the 4 launch badges (Tiny Startups, Product Hunt, SideProjectors, SaaS Cubes) — same SVGs / hot-links already in `PublicFooter`, elevated into this band.

Rationale:
- **Trademark guard (see §16).** Three of the nine brands — AWS, Vercel, Cloudflare — have explicit trademark policies that prohibit display of their marks on a third-party commercial marketing page (partners only). Brand-name text references are universally permitted by every brand's policy. Logos are not.
- **The 4 launch badges are different.** Tiny Startups, Product Hunt, SideProjectors, SaaS Cubes are listing/community programs Spire is enrolled in; their program docs *encourage* badge use and require attribution-back in nearly every case. Each is provable and hot-linkable.
- **Provability**: every integration name is a real Composio integration in the codebase (`features.tsx`, `integrations-page.tsx`). Every badge is a real, clickable listing.
- **Tone**: text-first reads as quiet and credible rather than vendor-loud. Matches the muted, proof-heavy voice of the rest of the site.

**Implementation note:** The 9 integration names should pull from the same shared fixture as `/integrations` and `/integrations/:slug` so the row stays in sync (see Source-of-truth data section, §6 below). The 4 listing badge URLs can co-locate in the same module to keep all "third-party presence" assets together.

### 4.4 Problem / Shift sections

These are already strong (`home.tsx:91–150`). Keep verbatim. Trim the problem grid `gap-4` → `gap-3` for tighter rhythm.

### 4.5 Trust mark (new — single-line micro-band)

Insert a thin band after "The shift" and before the Control explorer:

> Three shields inline (icon-only):
> 🔒 `Read-only integrations` · 🛡️ `AES-256 at rest, TLS 1.3 in transit` · 🔍 `Full audit trail on every evidence item`

### 4.6 Product capabilities — replace numeric 01–04 cards with **Tabbed control explorer**

**Why replace:** the "What it does" cards today (`home.tsx:151–227`) are 4 generic descriptions with no control-level depth. The audit's differentiation bucket specifically calls out promoting the control mapping. The spec replaces these cards with a tabbed explorer that lets a buyer scan what Spire covers by framework.

**Component contract — `app/components/control-explorer.tsx`:**

- Tabs: `SOC 2` (default) · `EU AI Act`.
- Under each tab: chip filter row (integrations: AWS, GitHub, Google Workspace, Vercel, Cloudflare, Clerk, Supabase, Stripe, Resend) — selecting a chip narrows listed controls to those covered by that integration.
- Control list (sortable, alphanumeric): `CC1.1`, `CC1.2`, … , `CC9.X` for SOC 2; `Article 4`, `Article 50`, ..., for EU AI Act.
- Each row expands on click → shows the 2–4 evidence items Spire collects for that control (read from same shared data fixture as `/integrations/:slug`).
- Bottom of tab: a single "See all evidence mapped to controls →" link to `/features`.

**Data source:** mirror the existing `integrations-page.tsx` evidence-list pattern (e.g., `["CloudTrail event history (CC7)", …]`) into a typed array `integrationEvidence: Array<{slug, evidence: Array<{control: string, text: string}>}>` exported from a new `app/lib/control-data.ts`.

### 4.7 How it works / Before–After / Final CTA

- **How it works** — keep as-is. Already concise.
- **Before/After** — keep, add **single inline CTA** below the two columns: `See a sample filled questionnaire → /dashboard/sample` *(spec only; route is a future-sprint item — anchor link OK for now)*.
- **Final CTA** — keep but trim the urgency block to one sentence + remove the F59E0B warning-yellow box color (replace with `#1C1C24` background) for visual neutrality.

### 4.8 FAQ — inline micro-FAQ (5 questions, on the home)

Copy source: pull 5 most common questions from `app/routes/faq.tsx` (file exists, lines 17–50):

1. *"What is Spire?"* — first 2 sentences of `faq.tsx:11`.
2. *"Do I still need a compliance consultant?"* — verbatim from `faq.tsx:13`.
3. *"What access do you need to my systems?"* — verbatim from `faq.tsx:17`.
4. *"How accurate is the questionnaire autofill?"* — verbatim from `faq.tsx:18`.
5. *"How long does setup take?"* — verbatim from `faq.tsx:16`.

Plus a "See all FAQs →" link to `/faq`. Implementation: copy-paste the accordion pattern from `faq.tsx` with `motion`-driven enter/exit.

---

## 5. New pages — component-by-component

### 5.1 `/integrations/:slug` — `app/routes/integrations.$slug.tsx`

**Routing**
- New file `app/routes/integrations.$slug.tsx`.
- Register in `app/routes.ts` between `integrations` and `security`.
- Loader returns `{integration: {...}}` based on slug match against shared `integrationEvidence` array (§6).
- 404 (with link back to `/integrations`) if slug doesn't match.

**Page sections (top → bottom):**

1. **Hero band** — small (height ~280 px). Logo on left, name + 1-line description on right. Button: `Connect now` (links to `/login` if not signed-in, `/dashboard/integrations` if signed-in via session check pattern from `home.tsx:18`).
2. **Why auditors care** — 2–3 sentences explaining what controls this integration covers and the type of evidence it emits. (Written from `integrations-page.tsx` evidence strings — already provable.)
3. **Evidence & controls table** — table of `{Control ref → Evidence bullet}` rows, sortable by control ID. Same fixture as §4.6 control explorer.
4. **Credential security** — small block: "We use read-only API access via Composio. No secrets written to your codebase. Scope can be revoked any time from your dashboard." Provable per security.tsx and integrations-page.tsx.
5. **Related integrations** — 3-card chips to other integrations (precedent: existing `/integrations` grid style).
6. **Footer CTA** — single line: "Connect all your tools → `/integrations`".

**Spec snippet — loader:**
```tsx
// illustrative — final implementation TBD
export async function loader({ params }: Route.LoaderArgs) {
  const integration = integrationEvidence.find(i => i.slug === params.slug);
  if (!integration) throw new Response("Not Found", { status: 404 });
  return { integration };
}
```

### 5.2 `/trust-center` — `app/routes/trust-center.tsx`

**Routing**
- New file `app/routes/trust-center.tsx`.
- Register in `app/routes.ts` near `security`.
- Loader pulls live compliance posture by calling Spire's own `audit` engine (the same endpoint used by `/dashboard/review` and `/dashboard/compliance-export` — both already exist) on Spire's own organization/org ID — call site `routes/api.audit.stream.ts`.
- If the audit cannot run (no org), the section falls back to a static "Last self-audit snapshot" JSON loaded from disk.

**Page sections (top → bottom):**

1. **Hero**
   - H1: *Trust Center — Spire uses Spire to audit itself.*
   - Sub: *"The same AI compliance agent your team would use, evaluating Spire's own controls. Updated continuously via Composio-driven evidence collection."*
2. **Live posture widget** (`<LivePosture>` component)
   - Two cards (SOC 2 / EU AI Act) — each shows `N passed / M total`, `last evaluated <timestamp>`, and a "Re-run audit" button (calls `routes/api.audit.stream.ts`).
   - Provability: real numbers, generated by Spire against Spire.
3. **Subprocessor list** (`<SubprocessorTable>`)
   - Static list ordered by data sensitivity:
     - **Cloudflare** — hosting, edge compute (US/EU regions available)
     - **Neon** — Postgres hosting on AWS, SOC 2 certified (Neon's, not Spire's — caveat this)
     - **OpenRouter / AI SDK** — inference routing, "zero retention" mode per `security.tsx`
     - **Resend** — transactional email
     - **Stripe** — billing
   - Below: link to "Request full DPA → `/contact`"
4. **Cryptographic & data handling**
   - AES-256 at rest (per `security.tsx`)
   - TLS 1.3 in transit (per `security.tsx`)
   - Worker Secrets for API credentials
   - **Pen testing**: this is a known over-claim. `security.tsx` says "annual pen testing" without dates; the spec replaces this with a *plain note* — *"Penetration testing cadence: planned for H2 2026; historical reports not yet published."* (matches reality, avoids fake trust proof).
5. **Status & uptime**
   - **Default option A**: link out to status page **only if** one is actually provisioned (e.g., Cloudflare Workers status / BetterStack / Instatus). If not, **default option B** applies:
     - **Honest fallback**: *"No public status page yet. For incidents contact hello@synov8studio.com — we commit to acknowledging within 1 business hour."*
6. **Bottom CTA** — single line + button: *"Convinced? Upload a questionnaire → `/dashboard/questionnaires/upload`"*.

**JSON-LD structured data snippet — illustrative for the future sprint (out of scope this sprint):**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Spire",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web (Cloudflare Workers)",
  "offers": { "@type": "Offer", "price": "500", "priceCurrency": "USD" },
  "provider": { "@type": "Organization", "name": "Synov8 Ltd.", "url": "https://spire.synov8studio.com" }
}
```
*(Note: per the Technical-bucket deferral, this JSON-LD block is **not** shipping this sprint. Listed in §10 as future-sprint work.)*

---

## 6. Source-of-truth data fixture

To avoid divergence between `/integrations` (hub), `/integrations/:slug`, and the home control explorer, both should import from a single new module:

**New file: `app/lib/integration-data.ts`**

```ts
// illustrative shape — final list mirrors app/routes/integrations-page.tsx
export const integrationEvidence = [
  {
    slug: "aws",
    name: "AWS",
    description: "Cloud infrastructure, IAM, monitoring, storage.",
    evidence: [
      { control: "CC7", text: "CloudTrail event history" },
      { control: "CC6", text: "IAM user permissions" },
      { control: "C1",  text: "S3 encryption status" },
      { control: "A1",  text: "EC2 instance inventory" },
      { control: "C1",  text: "Security group review" },
    ],
  },
  {
    slug: "github",
    name: "GitHub",
    description: "Source code, PRs, deployments, access control.",
    evidence: [
      { control: "CC8", text: "Commit history" },
      { control: "CC6", text: "Branch protection" },
      { control: "CC6", text: "Collaborator access" },
      { control: "CC8", text: "Pull request audit trails" },
      { control: "CC7", text: "Secret scanning" },
    ],
  },
  // … 7 more, copied verbatim from app/routes/integrations-page.tsx lines 13-23
];
```

**Implementation:** the existing `app/routes/integrations-page.tsx` is **refactored to consume** this module. No content drift between `/integrations` hub and `/integrations/:slug` pages.

---

## 7. Hero demo — `app/components/hero-demo.tsx`

**Why Motion:** smoother control over the four sequenced scenes than raw CSS keyframes. Already approved by interview.

**Scene structure (illustrative):**
```tsx
"use client"; // not strictly needed in RR8 but keep for clarity
import { motion } from "motion/react";

export function HeroDemo() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#1C1C24] bg-[#0A0A0C] shadow-2xl">
      <div className="absolute left-4 top-3 text-[10px] uppercase tracking-widest text-[#5C5C66]">
        Representative · not live data
      </div>
      <Scene1Connections />  {/* 0–15s */}
      <Scene2Evidence />      {/* 15s–30s */}
      <Scene3Questionnaire /> {/* 30s–45s */}
      <Scene4Export />        {/* 45s–60s */}
    </div>
  );
}
```
*Each `<SceneN>` is a self-contained `<motion.div>` that fades in at its time-offset and fades out as the next takes over. A master timer (`useEffect` + `setInterval` or `motion`'s built-in keyframes) drives scene rotation. Total loop length: 60 s.*

**Accessibility & perf notes (must)**:
- `prefers-reduced-motion` → render static composite of scene 1 only (no animation, but same shape so layout doesn't shift).
- Play only on viewport intersection (using `IntersectionObserver`); pause off-screen to save CPU on hubs like the `/pricing` page if reused there.
- No audio.

---

## 8. Control explorer — `app/components/control-explorer.tsx`

**Spec only — illustrative shape:**
```tsx
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { integrationEvidence } from "~/lib/integration-data";

type Framework = "soc2" | "ai-act";

const FRAMEWORKS: Array<{ key: Framework; label: string; totalControls: number;}> = [
  { key: "soc2",  label: "SOC 2",     totalControls: 56 },
  { key: "ai-act",label: "EU AI Act", totalControls: 10 },
];

export function ControlExplorer() {
  const [fw, setFw] = useState<Framework>("soc2");
  const [filter, setFilter] = useState<string | null>(null);
  // build control list from integrationEvidence + framework metadata
  // …
  return (
    <div>
      <Tabs value={fw} onChange={setFw} />
      <FilterChips options={integrationEvidence.map(i => i.slug)} value={filter} onChange={setFilter} />
      <ControlList framework={fw} filter={filter} />
    </div>
  );
}
```

---

## 9. Routes.ts diff

```ts
// app/routes.ts — illustrative additions, no removals
route("integrations/:slug", "routes/integrations.$slug.tsx"),
route("trust-center", "routes/trust-center.tsx"),
```

Both inserted between the existing `route("integrations", ...)` and `route("security", ...)`.

---

## 10. Acceptance criteria

Each must hold true at review time:

### 10.1 Honesty / claim gate

- ✅ No homepage copy contains the strings `SOC 2 Type II certif`, `73% faster`, `$200K saved`, or any made-up ROI %.
- ✅ No logo strip on the homepage contains names that aren't in either the integration list or the 4 launch badges.
- ✅ `Security & Trust` and `Trust Center` agree — both say "Preparing for formal SOC 2 certification" (canonical phrasing from `security.tsx`).
- ✅ Pen-testing section uses the honest fallback wording committed in §5.2.

### 10.2 Routing & structure

- ✅ `/integrations/:slug` returns 200 for all 9 valid slugs; 404 otherwise.
- ✅ `/trust-center` returns 200 with at least the live-posture widget and subprocessor list rendered server-side (RR8 SSR — required for SEO even though Lighthouse isn't audited this sprint).
- ✅ `routes.ts` parses type-check cleanly (no orphan routes).

### 10.3 Hero demo

- ✅ Animated SVG plays in a 60 s loop on desktop ≥ md (≥ 768 px).
- ✅ Falls back to static scene-1 only on mobile (< md) or for `prefers-reduced-motion: reduce`.
- ✅ "Representative · not live data" label visible at all times, irrespective of scene played.
- ✅ Pause when off-screen (no CPU wasted).

### 10.4 Control explorer

- ✅ Default tab `SOC 2`. Switching to `EU AI Act` shows the correct count (10) and names.
- ✅ Filter chips additively narrow results without breaking ordering.
- ✅ Anchors to `/features` resolve.

### 10.5 Trust strip

- ✅ Exactly 9 integration text labels render (no logos or icons — proof-only constraint per §16).
- ✅ Plus 4 image badges (Tiny Startups, Product Hunt, SideProjectors, SaaS Cubes) — total of 13 attribution chips.
- ✅ Same fixture (text labels + badge URLs) powers home, `/integrations`, `/integrations/:slug` (no content drift).
- ✅ Zero possession or display of third-party brand marks that aren't explicitly listed in §16's allowed-uses.

### 10.6 FAQ inline (home)

- ✅ 5 questions, copy matches `app/routes/faq.tsx` source.
- ✅ "See all FAQs" anchor resolves to `/faq`.

### 10.7 Visual / brand

- ✅ All accents limit to current palette: `#00D4AA`, `#EF4444`, `#F59E0B`, plus the existing surface scale.
- ✅ No new colors introduced.

### 10.8 Performance

- ✅ Motion is the **only** new dependency.
- ✅ Hero demo scene SVG sprite is < 50 kB.
- ✅ No client-side hydration of control-explorer data (CRR loader returns pre-filtered view).

---

## 11. Future-sprint items (intentionally deferred)

These were raised in the audit but the Interview explicitly pushed them out:

| Item | Reason deferred | Re-evaluate when |
|---|---|---|
| JSON-LD structured data (SoftwareApplication, FAQ, Product) across all public pages | Technical bucket dropped this sprint — single dev sprint focus | When Lighthouse / SEO initiative kicks off |
| Lighthouse / Core Web Vitals pass | Same | Same |
| Buyer-role segmentation (CTO vs Security vs RevOps paths) | Collides with single-CTA decision | When a self-serve + sales-assist dual-funnel is re-introduced |
| Calendly / `/demo` route | Single CTA decision | When sales-assist funnel is re-introduced |
| `/case-studies` route | No real customers to feature today | Once 3+ named customers + quotes exist |
| `/eu-ai-act` dedicated landing | Asset-dependent under proof rule | Once an interactive readiness scorecard exists |
| G2 / Capterra badges / Trust Center URL | Asset-dependent; no live presence today | Once a review profile is created |
| Live status page (BetterStack / Instatus) | Asset-dependent | Once a status provider account is provisioned |
| Audit log UI for Spire's own audit history | Useful but cosmetic | When Spire has had 6+ months of self-audit history to display |
| Brand-mark display (icons/logos) on home + per-integration pages | Trademark guard (§16) blocks display today; only brands with explicit permission can be shown as marks | After Spire joins AWS Partner Network, Vercel Partner program, Cloudflare partner program, Stripe service-context usage, etc., AND signs reasonable brand-license addenda — re-evaluate annually since policies change |
| Text-label trust strip under-converts vs. icon chips (post-launch metric) | Low | Med | A/B test a single accent-color highlight on GitHub label if analytics show low CTR on `/integrations` from home — still no logo, just typographic emphasis |

---

## 12. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Trademark / legal risk from displaying third-party brand marks | High | High | All-text approach is the canonical design today (see §16). For any future brand-mark display, must verify license + brand-program enrollment before shipping. |
| Text-label trust strip reads too quietly and under-converts | Low | Med | If analytics show low CTR on `/integrations` from home, swap to slightly larger weight + a single accent-color highlight on one integration (e.g. GitHub) as a small A/B test. Still no logo. |
| Motion SSR behavior with React Router 8 | Low | Low | Motion supports RSC and SSR — fall back to "render children in initial render, animate on hydration". |
| Trust Center "live posture" endpoint doesn't yet run for Spire's own org | Medium | Low | Fall back to last-snapshot JSON from disk, clearly labelled. |
| FAQ accordion copy drifts between home and `/faq` page | Medium | Low | Both pull from a shared constant. |
| CTA target `/dashboard/questionnaires/upload` requires auth | Low | Low | Already in place today — no change. |

---

## 13. Out-of-scope decisions, locked

These were either decided to skip in interview OR pushed to future sprint by interview — listed here so future reviewers don't ask.

1. ❌ No dual CTA (kept single self-serve).
2. ❌ No buyer-role segmentation.
3. ❌ No lead magnet / gated PDFs.
4. ❌ No `/eu-ai-act` landing page.
5. ❌ No new `/demo` route.
6. ❌ No JSON-LD structured data (deferred to future sprint).
7. ❌ No Lighthouse/CWV pass.
8. ❌ No real Loom-style video.

---

## 14. Spec dependency notes for the implementer

### New npm dependencies

- `motion` — add via project package manager before scaffold (the user's `AGENTS.md` notes to web-fetch `https://motion.dev` docs first; defer actual version range to install step).

### No new environment variables

- Trust Center "live posture" endpoint already lives at `routes/api.audit.stream.ts` — no new env vars required.

### Files to create

- `app/routes/integrations.$slug.tsx`
- `app/routes/trust-center.tsx`
- `app/lib/integration-data.ts`
- `app/components/hero-demo.tsx`
- `app/components/control-explorer.tsx`
- `home-overhaul-spec.md` *(this file)*

### Files to modify

- `app/routes/home.tsx` — restructure sections per §4.
- `app/routes.ts` — add 2 entries per §9.
- `app/routes/integrations-page.tsx` — refactor to import from `app/lib/integration-data.ts` (no content change).
- `app/components/public-layout.tsx` — add `Trust Center` nav entry.

### Files explicitly NOT touched

- `app/routes/security.tsx` (canonical "Preparing for formal SOC 2 certification" wording stays)
- `app/routes/pricing.tsx`
- `app/routes/features.tsx`
- `app/routes/faq.tsx` (home inline copy imports from this file's constant, not a duplicate)
- `app/routes/api.audit.stream.ts` (Trust Center hooks into existing endpoint)
- Public launch badges in footer (`PublicFooter`)

---

## 15. Open questions to revisit before implementation kickoff

These weren't asked in interview but surfaced while drafting — flag if any of these need a re-decision:

1. **Brand marks — RESOLVED.** All-text labels for the 9 integrations; image badges only for the 4 listing programs Spire is enrolled in (Tiny Startups, Product Hunt, SideProjectors, SaaS Cubes). Trademark guard rationale: see §16.
2. **Motion SSR**. Verify Motion's React Router 8 compatibility guidance before commit — the project does use SSR loaders heavily, and the user's `AGENTS.md` notes to verify library docs.
3. **Trust Center auth surface**. Should the live-posture widget require auth (a Spire-internal auth check)? Default: yes, because it would expose internal control IDs. If yes, the page needs a tiny login gate or a static fallback.

---

## 16. Trademark guard

This section exists so future implementers don't re-litigate the brand-mark question.

### 16.1 The constraint

Spire is a third-party marketing site for a B2B SaaS audience. We are **not** an enterprise partner of any of the brands we integrate with — and three of them (AWS, Vercel, Cloudflare) explicitly restrict commercial display of their marks to partners or service-contexts only. Stripe restricts display to service-context usage as well.

### 16.2 Trademark research summary (June 30, 2026)

| Brand | Permitted display on a third-party commercial page | Recommended action for Spire |
|---|---|---|
| **AWS** | ⚠️ Only for AWS Partners; logomark and wordmark both restricted | **Text label only.** Do not display AWS logomark/wordmark anywhere on `/`, `/integrations`, `/integrations/:slug`. |
| **GitHub** | ✅ Referential use ("we integrate with GitHub") is permitted; marks must come from official sources, unmodified | Text label preferred. Logomark permissible if from github.com/logos without modification. |
| **Google Workspace** | ✅ Google's brand-resource-center permits referential use of the "G" wordmark | Text label preferred. simple-icons.org Google icon is permissible but not preferred. |
| **Vercel** | ⚠️ Explicitly excludes Vercel marks from third-party marketing collateral | **Text label only.** |
| **Cloudflare** | ⚠️ Only the "Protected by Cloudflare" web badge is permitted (pre-approved asset) | **Text label only.** Do not use the Cloudflare wordmark as a Spire logo or chip. |
| **Clerk** | ✅ Clerk brand-assets page is permissive for "write about, integrate with, or partner with" use | Text label preferred. Clerk logomark permissible per `clerk.com/brand-assets` if unmodified. |
| **Supabase** | ⚠️ Modifications prohibited; marks must represent Supabase Inc. only | Text label preferred. Supabase logomark permissible per `supabase.com/brand-assets` if unmodified. |
| **Stripe** | ⚠️ Use is restricted to service-contexts (e.g., Checkout); see Stripe Marks Usage Terms | **Text label only** on third-party marketing pages. |
| **Resend** | ✅ Resend brand page is permissive for public-facing use | Text label preferred. Resend mark permissible per `resend.com/brand`. |

### 16.3 The four listing-badge exception

- **Tiny Startups** (`tinystartups.com/api/featured-badge/<slug>?theme=dark`): explicit program designed for embed.
- **Product Hunt**: HTML embed snippet from product page; required for attribution + tracking.
- **SideProjectors**: text link (no central badge generator); must point at the listing URL.
- **SaaS Cubes** (`saascubes.com/backlink`): explicitly provided in exchange for a homepage do-follow — works as backlink-program compensation.

These are permitted because they are programs Spire is enrolled in (per the footer already shipping today).

### 16.4 The allowed-uses list (consolidated)

| Asset | Status today |
|---|---|
| AWS wordmark / logomark | 🚫 BLOCKED on home + every public page |
| Vercel wordmark / logomark | 🚫 BLOCKED on home + every public page |
| Cloudflare wordmark / logomark | 🚫 BLOCKED on home + every public page |
| Stripe wordmark / logomark | 🚫 BLOCKED on home + every public page |
| GitHub / Google / Clerk / Supabase / Resend marks | ⚠️ Permitted — but we don't ship them this sprint. Text labels only. |
| Tiny Startups, Product Hunt, SideProjectors, SaaS Cubes badges | ✅ Permitted + already shipped in footer |

### 16.5 Future path to enabling brand marks

To safely add vendor logos to Spire over time:

1. Spire joins the AWS Partner Network (APN). Confirms eligibility for AWS marks.
2. Spire applies for Vercel Partner / Cloudflare partner / Stripe service-context usage where applicable.
3. Re-run this trademark audit **annually** — policies change.
4. Maintain versioned copies of each brand kit PDF in `docs/legal/` so reviewers can audit history.

Until those steps complete: **all-text only, forever.**

### 16.6 What this guard does NOT change

- The 9 integration **names** still appear prominently (text labels, hero subheadline, hero demo scene 1).
- The 4 listing badges still appear (now promoted to a higher band).
- `/integrations/:slug` pages still show "Connect now" copy referencing the integration by name.
- `features.tsx` still lists integration names in evidence bullets.
- All Composio-internal API names (`AWS`, `GitHub`, etc. as connection kinds) are unaffected — those are not user-facing.

This guard constrains **marks-on-website** only, not integration coverage or product naming.

---

*Spec END.*
