feat(integrations): rewrite hub as a categorized directory

The user pointed out the /integrations hub carried noticeable bloat —
a single 3-col grid of all 30 marketing cards with full evidence
bullets inlined per card. Now turned into a slim categorized
directory that defers evidence detail to the deep-dive pages.

Three coordinated changes:

1. INTEGRATION_CATEGORIES hoisted to app/lib/integration-data.ts
   as a canonical export. Previously lived as a module-local const
   inside app/components/control-explorer.tsx, so the directory
   addition would have re-declared an identical array. Single source
   of truth now drives both ControlExplorer filter chips and the
   hub's grouped-directory rendering. Dev-time missing-slug safety
   warning moved alongside the export so the invariant fires at
   module-init regardless of which surface first imports it.

2. control-explorer.tsx dropped the local const + local warning.
   import block extended to include INTEGRATION_CATEGORIES. No
   behaviour change for the homepage coverage table — filter chip
   row still resolves identically.

3. integrations-page.tsx (the hub) rewritten. Hero copy reshaped
   to "{N} read-only integrations, grouped by what they actually
   prove", body copy de-duplicated from a code-review round-1 fail.
   3-col grid + per-card evidence bullets gone. One rounded-xl
   panel now holds 8 stacked section rows whose structure mirrors
   the homepage's chip layout (same w-24 uppercase category labels,
   same colour tokens) so the two pages read like one design
   system rather than two parallel concepts. Each integration row
   is a slim link to /integrations/:slug where the full evidence
   & controls table lives — the hub no longer recreates that
   surface inline. Net: significantly less inbound-HTML bloat,
   faster scanning across 30 integrations, and the deep-dive
   pages get the click-traffic they were already designed for.

Typecheck exit 0. Reviewer round 1 flagged the hero "no agents"
copy duplication, fixed before commit. Reviewer round 1 also
confirmed the hub now has meaningfully less duplication with
the homepage ControlExplorer: hub reads "integrations by
discipline", home reads "controls by integration".
