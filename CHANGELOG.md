# Changelog

All notable changes to Spire are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
insofar as the public marketing surface is concerned. Internal /api/*
endpoints and dashboard contracts are tracked separately by git history.

Spec cross-references follow the format `§N` and refer to
[`home-overhaul-spec.md`](./home-overhaul-spec.md) — the locking
implementation spec for the homepage reorg and related public surface
changes.

---

## [1.0.0] — 2026-06-30

The public marketplace surface. Consolidates the homepage overhaul,
two new routes (`/integrations/:slug`, `/trust-center`), the integration
data fixture extraction, the JSON-LD structured-data round, and the
first wave of Lighthouse / Core Web Vitals work into a single cohesive
release milestone.

### Added (UX — spec §4)

- **`/` (`app/routes/home.tsx`)** — Re-org of 11 sections per spec §4.1
  ordering: Hero → TrustStrip → Problem → The Shift → Trust Mark →
  Control Explorer → Before/After → How It Works → Security & Trust →
  Inline Micro-FAQ → Final CTA.
- **`app/components/hero-demo.tsx`** — New Motion-driven animated SVG
  demo, 4-scene 60-second loop (Connections · Evidence · Questionnaire
  · Export). Honors `prefers-reduced-motion` and pauses off-screen
  via `IntersectionObserver`. The on-screen label
  `Representative · not live data` is always rendered (§10.3).
- **`app/components/control-explorer.tsx`** — New tabbed explorer
  (SOC 2 / EU AI Act) with integration-name filter chips. Each row
  expands to show the integration-driven evidence. EU AI Act rows are
  honestly tagged `Pending mapping` or `Mapping emerging` (§10.4).
- **`app/components/home-faq.tsx`** — New 5-question inline micro-FAQ
  on `/` (§4.8, §10.6). Pulls questions verbatim from the canonical
  `~/lib/faq-data` module so copy drift is impossible by construction.
- **`app/components/trust-strip.tsx`** — Two-layer trust strip
  replacing the previous 4-generic-chip row (§4.3, §10.5):
  - Layer 1 (left): 9 integration names as plain text labels
    separated by `·`, in `#8B8B93` muted color.
  - Layer 2 (right): 4 listing badge SVGs (Tiny Startups, Product
    Hunt, SideProjectors, SaaS Cubes) — these are the assets the
    trademark guard §16 explicitly permits.

### Added (Conversion — spec §5)

- **`/integrations/:slug` (`app/routes/integrations.$slug.tsx`)** —
  New per-integration landing page (§5.1). Six sections: hero band ·
  why auditors care · evidence & controls table · credential security
  · related integrations · footer CTA. Loader returns 404 for unknown
  slugs.
- **`/trust-center` (`app/routes/trust-center.tsx`)** — New provable
  trust surface (§5.2). Five sections: hero · live posture widget ·
  subprocessor list · cryptographic & data handling · status &
  uptime. Pen-test wording is the honest "planned H2 2026; historical
  reports not yet published" copy — never claims a cert that doesn't
  exist.
- **Trust Center nav entry** in `app/components/public-layout.tsx` —
  `navLinks` includes `Trust Center`.

### Added (Differentiation — spec §4.6 + §6)

- **`app/lib/integration-data.ts`** — Single source of truth for the
  9 Spire integrations. Exports `INTEGRATIONS`, `INTEGRATION_NAMES`,
  `INTEGRATIONS_BY_SLUG` (O(1) lookup), and `INTEGRATION_SLUGS`.
  Powers `/integrations`, `/integrations/:slug`, `/` (hero demo
  scene 1), and `ControlExplorer` (§6).
- **`app/lib/faq-data.ts`** — Single source of truth for FAQ copy.
  Powers `/faq` and `HomeFaq` (§4.8 + §10.6).

### Added (Technical — spec §11 deferred items, now shipped)

- **`app/lib/structured-data.ts`** — Canonical JSON-LD factories
  per spec §11 first deferred item. Schema type systems locks
  `@context: "https://schema.org"` at the type level. Factories:
  `softwareApplicationSchema()` `/`
  `homeFaqPageSchema()` `/`
  `pricingProductSchemas()` `/pricing`
  `organizationSchema()` all routes except pricing
  `integrationsItemListSchema()` `/integrations`
  `articleSchema(meta)` `/blog/:slug`
  `faqPageSchema(faq)` `/blog/:slug` (returns `null` when no FAQ block)
  `integrationServiceSchema(slug, name, desc)` `/integrations/:slug`
  `definedTermItemListSchema(entries)` `/glossary`.
- **`app/components/structured-data.tsx`** — General `<StructuredData />`
  component. Single API surface replacing the legacy
  `app/components/geo-schema.tsx` (now deleted). Accepts
  `Schema | Schema[] | null`; renders one or more
  `<script type="application/ld+json">` blocks.
- **JSON-LD on every public route** — all 9 pages emit canonical
  schema markup verified via curl + JSON-LD parsers; legacy
  OrganizationSchema + ArticleSchema + FAQSchema helpers plus the
  inline `<script>` block at the end of `/glossary` are deleted.
- **`app/lib/buyer-role.ts`** — Pure 1st-party buyer-role
  personalization for spec §11. URL parsing + cookie read + cookie
  write, no network calls, no telemetry, no third-party vendor.
  Exports `BuyerRole`, `BUYER_ROLES`, `parseRoleFromUrl`,
  `readRoleFromCookie(request)` (SSR-safe), and `storeRoleCookie(role)`
  (client-only). The cookie is set ONLY by us, read ONLY by us, and
  never leaves the device.
- **Buyer-role CTA microcopy on `/`** — Final CTA section now shifts
  eyebrow + headline tail + sub depending on the inferred
  `BuyerRole` (`cto` / `security` / `revops` / `unknown`). Loader
  resolves the role from a 30-day cookie (read via
  `readRoleFromCookie`); the same cookie gets set client-side if a
  visitor lands via a campaign URL with `?role=…` so subsequent
  reloads see the right variant. The CTA target is identical across
  variants — we are segmenting tone of conversation, not paywalled
  features (spec §10.1 honesty rule).
- **Inter font preload + size-adjust fallback** in `app/root.tsx`
  and `app/app.css` — adds `<link rel="preload" as="style"
  fetchpriority="high" crossOrigin="anonymous">` ahead of the normal
  `<link rel="stylesheet">` so the browser fetches Google Fonts in
  parallel with HTML parsing, plus
  an `@font-face { font-family: "Inter Fallback"; size-adjust: 107%; … }`
  metric override so `font-display: swap` does not trigger a CLS
  shift when Inter swaps in.


### Changed

- **`app/components/public-layout.tsx`** — Added `Trust Center` to
  `navLinks`.
- **`app/routes/home.tsx`** — Loader now reads `spire_role` cookie
  and resolves the inbound `?role=` URL param; the Final CTA
  section uses one of 4 microcopy variants keyed by role.
  The variant is passed through `loaderData` so SSR HTML never
  mismatches client HTML on first paint.
- **`app/components/structured-data.tsx`** — Type widened from
  `Schema | Schema[]` to `Schema | Schema[] | null` to preserve
  the legacy `FAQSchema` early-return behavior.

### Removed

- **`app/components/geo-schema.tsx`** — Legacy `ArticleSchema` /
  `FAQSchema` / `OrganizationSchema` helpers. Replaced by the
  single `<StructuredData />` + factory pattern in `app/lib/structured-data.ts`.
- **Inline `<script type="application/ld+json">` in `glossary.tsx`** —
  Replaced by `definedTermItemListSchema(entries)` factory + `<StructuredData />`.
- **`app/lib/analytics.ts`** — Provider-agnostic analytics façade
  (`track`, `reportWebVitals`, `BuyerRole` derivation helpers).
  Deleted in full. The pure-personalization helpers
  (`parseRoleFromUrl`, `readRoleFromCookie`, `storeRoleCookie`,
  `BuyerRole` type) are ported to the lean `app/lib/buyer-role.ts`
  — 1st-party personalization only, no network calls, no vendor.
- **`app/routes/api.analytics-events.ts`** — Server-side receiver
  for client `track()` POSTs. With `track()` removed, the
  endpoint has no callers; deleted in full.
- **`app/components/perf-emitter.tsx`** — `<PerfEmitter />` LCP + CLS
  beacon mount. With `reportWebVitals()` removed, no callers;
  deleted in full — and with it, the entire client-side web-vitals
  telemetry pipeline. Site ships zero instrumentation on every
  public page.
- **`app/routes/security.tsx`** — Legacy standalone `/security` page.
  Removed in full; its canonical SOC 2 posture statement and
  subprocessor/trust content were already superseded by `/trust-center`.
  All cross-references (nav, footer, sitemap, llms.txt, control
  explorer, trust-center, spire-self-audit data, structured-data
  docblocks) are updated to point to `/trust-center` instead.

### Honest non-claims (spec §10.1 + §16)

- SOC 2 wording across `/` and `/trust-center` agrees — both say
  "Preparing for formal SOC 2 certification" per `trust-center.tsx`'s
  canonical phrasing.
- Pen-test section uses the honest "planned H2 2026; historical
  reports not yet published" copy; no false claims.
- AWS / Vercel / Cloudflare / Stripe marks are not displayed
  anywhere; text labels for integrations only (§16 trademark guard).
- The 4 listing badges (Tiny Startups · Product Hunt · SideProjectors
  · SaaS Cubes) are the ONLY third-party brand assets displayed on
  the public surface.

### Verification

- `npm run typecheck` exit 0 across all 13 files changed/added.
- `curl /` returns HTTP 200 with `SoftwareApplication.operatingSystem === "Web"`
  and `FAQPage.mainEntity.length === 5`; `curl /pricing` returns 3
  Products each with `brand.url`; `curl /{trust-center,blog,blog/<slug>,glossary}`
  emit valid Organization / Article [+ optional FAQPage] / ItemList of
  DefinedTerm structured data.
- No 1st-party brand marks on `/` beyond the 9 integration names
  (text) and 4 listing program badges.

---

## Unreleased

Items tracked here have landed in the codebase but are not yet tagged
into a release. They will be folded into the next semver bump.

### Added

- **`HR/HCM integrations` (`app/lib/integration-data.ts`)** — Closes
  the gap called out in `SPEC.md §6.1` ("HR systems (optional)") and
  the corresponding `home-overhaul-spec.md` integration coverage
  criterion. Adds 5 HRIS integrations to both `INTEGRATIONS` and
  `DASHBOARD_INTEGRATIONS` so the hero demo scene 1, `/integrations`
  hub, `/integrations/:slug` per-integration pages, and the control
  explorer's integration filter chips all pick them up automatically:
  - **BambooHR** — SMB HRIS, employee directory, onboarding. Slug
    `bamboohr`, dashboard initial `BH`. Evidence (4): Employee
    directory with employment status (CC6), hire records with start
    dates (CC6), termination events with last-day timestamps (CC6),
    time-off and PTO tracking (CC1).
  - **Workday** — Enterprise HRIS, workforce / hire-to-retire
    lifecycle. Slug `workday`, initial `WD`. Evidence (4): Worker
    records with hire dates and departments (CC6), termination
    events with effective dates (CC6), job profile change history
    (CC6), background check completion (CC1).
  - **Gusto** — Payroll, benefits, contractor records for SMB. Slug
    `gusto`, initial `GS`. Evidence (4): Employee directory with
    employment status (CC6), contractor records (CC6), payroll admin
    action history (CC7), new contractor onboarding events (CC6).
  - **Rippling** — Unified HR + IT with app access provisioning.
    Slug `rippling`, initial `RP`. Evidence (4): Employee directory
    with role assignments (CC6), app access provisioning events
    (CC6), department and level changes (CC6), termination records
    (CC6).
  - **Personio** — European HRIS, employee + time-off. Slug
    `personio`, initial `PE`. Evidence (4): Employee directory with
    employment status (CC6), document storage audit (C1), onboarding
    checklists (CC6), time-off and attendance records (CC1).
- **Hardcoded referral counts refreshed** — hero subhead, hero
  eyebrow trust-strip line, and "Connect your systems" step card in
  `app/routes/home.tsx` now list all 14 integrations by name
  (including the 5 HR systems above) with the eyebrow rollover
  marker adjusted from `+4 more` to `+9 more` (since 14 total - 5
  visible = 9 hidden).
- **Dynamic integration names everywhere** — `app/components/hero-demo.tsx`
  Scene 1 footer counters (`{connectedCount}/{INTEGRATION_NAMES.length} connected`
  and `{INTEGRATION_NAMES.length}/{INTEGRATION_NAMES.length} connected`)
  and `app/lib/structured-data.ts` `softwareApplicationSchema()`
  description + `featureList` first bullet now interpolate
  `INTEGRATIONS.length` and the live integration-name list instead
  of the prior hardcoded `9`. Adding or removing an integration
  from `INTEGRATIONS` will propagate to all surfaces automatically.

### Changed

- **`app/components/hero-demo.tsx`** — Massive visual quality
  overhaul of the animated landing-page hero demo. The 4-scene
  Motion loop (Connections · Evidence · Questionnaire · Export) is
  preserved, but every scene and the container itself are rebuilt:
  - **Container**: Faux product window chrome (traffic lights +
    per-scene URL bar + honesty label in the chrome bar), subtle
    dot-grid background for depth, tinted brand shadow
    (`rgba(0,212,170,0.12)`) instead of generic `shadow-2xl`, and a
    4-dot scene progress indicator at the bottom (active dot is wider
    + brand-colored).
  - **Scene 1 (Connections)**: Integrations now animate through a
    connecting → connected state transition (spinner → checkmark +
    status labels), with a live X/9 counter footer and a pulsing
    live-dot header.
  - **Scene 2 (Evidence)**: Real evidence rows stream in from the
    integration-data fixture (integration initial badge + evidence
    text + control-ref badge), with a smoothly interpolated counter
    ramping to 247.
  - **Scene 3 (Questionnaire)**: True character-by-character
    typewriter animation (40 ms/char) replaces the opacity-fade
    placeholder; active question card gets a brand-tinted border;
    confidence bars replace text-only chips.
  - **Scene 4 (Export)**: Audit-pack file-list assembly (files appear
    one by one with FileIcon + name + size + checkmark) + gradient
    progress bar + success badge when complete.
  - **Transitions**: Directional slide+fade (`y: 10 → 0 → -10`)
    replaces bare opacity fade, giving a forward-progression cue.
  - All existing constraints preserved: `prefers-reduced-motion` →
    static Scene 1; viewport < 768 px → static Scene 1;
    `IntersectionObserver` pauses rotation off-screen; SSR-safe
    `hasMountedScene1` gate; honesty label always visible.
  - `npm run typecheck` exit 0.

### Deferred-from-§11 (still future-sprint)

These remain intentionally deferred per spec §11; do not implement
without re-reading the section:

- Calendly + `/demo` route — collides with single-CTA decision.
- Buyer-role dual-funnel (sales-assist + self-serve) — needs the
  segmentation scaffolding above to be live for at least one A/B
  cycle first.
- `/case-studies` route — depends on 3+ named customers.
- `/eu-ai-act` dedicated landing — depends on real readiness scorecard.
- G2 / Capterra badges — depends on a review profile.
- Live status page — depends on a status provider account (BetterStack /
  Instatus).
- Audit-log UI for Spire's ongoing self-audit history — depends on 6+
  months of self-audit data accumulating.
- Partner-network brand marks (AWS APN, Vercel Partner, Cloudflare
  Partner, Stripe service-context usage) — depends on enrollment.
- A typographic-emphasis A/B test on one of the 9 integration name
  labels — depends on analytics instrumentation landing first so we
  have a baseline CTR.

[1.0.0]: https://github.com/Synov8/spire/releases/tag/v1.0.0
