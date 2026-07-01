/**
 * Control explorer — tabbed SOC 2 / EU AI Act view per home-overhaul-spec.md §4.6 + §8.
 *
 * UX:
 *   • Two tabs: SOC 2 (default) · EU AI Act.
 *   • Filter chip row with the 9 integration slugs (single-select; click again to clear).
 *   • Control list (sortable alphanumeric) — SOC 2 controls are derived from
 *     INTEGRATIONS.evidence by control reference; EU AI Act articles are
 *     enumerated by their canonical short name.
 *   • Each row expands on click to show the integrations providing evidence +
 *     the human-readable evidence text.
 *   • Bottom: "See all evidence mapped to controls → /features".
 *
 * Behaviour constraints (see spec §10.4):
 *   • Default tab SOC 2; switching to EU AI Act shows 10 article rows.
 *   • Filter chips narrow results without breaking ordering.
 *   • No client-side hydration of the control list itself — the framework
 *     structure is built server-side from the typed fixture; only tab + filter
 *     + expand state are client.
 *
 * Honesty:
 *   • SOC 2: only controls actually emitted by the integrations fixture are
 *     listed. The control count from the spec is 56; we surface the subset
 *     Spire actually maps today.
 *   • EU AI Act: 10 article rows are enumerated, but each row's evidence is
 *     honestly tagged (most show "Mapping emerging — see /trust-center"). The 10
 *     names match the canonical EU AI Act topics the FAQ references
 *     (transparency, logging, human oversight, risk management, etc.).
 *
 * Data source: app/lib/integration-data.ts (single source of truth, also
 * powers /integrations and /integrations/:slug).
 */

import { motion, AnimatePresence } from "motion/react";
import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  INTEGRATIONS,
  INTEGRATIONS_BY_SLUG,
  INTEGRATION_CATEGORIES,
} from "~/lib/integration-data";

type Framework = "soc2" | "ai-act";

const FRAMEWORKS: ReadonlyArray<{ key: Framework; label: string; knownTotal: string }> = [
  { key: "soc2", label: "SOC 2", knownTotal: "56 common criteria" },
  { key: "ai-act", label: "EU AI Act", knownTotal: "10 articles" },
];

/** SOC 2 controls start with CC (common criteria) or with single-letter TSC names (C, A, PI). */
const SOC2_CONTROL_PATTERN = /^(CC|C\d+|A\d+|PI\d+)/;

function ArrowRight() {
  return (
    <svg className="ml-1 inline-block h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8h10m-3-4 4 4-4 4" />
    </svg>
  );
}

type Soc2Row = {
  control: string;
  /** Full evidence list — preserved for the expanded row state. */
  items: Array<{ slug: string; name: string; text: string }>;
  /**
   * Integrations providing evidence for this control, deduplicated by slug.
   * Drives the collapsed-row display + filter predicate (was duplicating
   * per-evidence-item before, ballooning CC6/CC7/C1 row widths).
   */
  integrations: Array<{ slug: string; name: string }>;
};

// INTEGRATION_CATEGORIES is imported from ~/lib/integration-data — single
// source of truth shared with the /integrations hub directory. Dev-time
// missing-slug safety check lives alongside the export so it fires
// regardless of which surface first imports the data module.

function buildSoc2Rows(): Soc2Row[] {
  // Per-control entries hold both the full evidence list (preserved for
  // the expanded row state) AND a deduplicated integrations map (drives
  // the collapsed display + filter predicate so CC6 shows "30 integrations
  // · 53 items" rather than repeating each integration per evidence item).
  // Per-control entries hold both the full evidence list (preserved for
  // the expanded row state) AND a deduplicated integrations map (drives
  // the collapsed display + filter predicate so CC6 shows "30 integrations
  // · 53 items" rather than repeating each integration per evidence item).
  const grouped = new Map<
    string,
    {
      items: Array<{ slug: string; name: string; text: string }>;
      integrations: Map<string, { slug: string; name: string }>;
    }
  >();
  for (const int of INTEGRATIONS) {
    for (const ev of int.evidence) {
      if (!ev.control || !SOC2_CONTROL_PATTERN.test(ev.control)) continue;
      // Type-annotated fallback. TypeScript widens an inline `{ items: [],
      // integrations: new Map() }` literal to `never`-typed arrays/maps
      // since the literal has no inferred element types — the cast below
      // keeps the downstream `push` / `set` calls type-checkable.
      const existing = grouped.get(ev.control);
      const entry = existing ?? {
        items: [] as Array<{ slug: string; name: string; text: string }>,
        integrations: new Map<string, { slug: string; name: string }>(),
      };
      entry.items.push({ slug: int.slug, name: int.name, text: ev.text });
      if (!entry.integrations.has(int.slug)) {
        entry.integrations.set(int.slug, { slug: int.slug, name: int.name });
      }
      if (!existing) grouped.set(ev.control, entry);
    }
  }
  return [...grouped.entries()]
    // Numeric ordering so CC6 < CC7 < CC8 < CC9 < CC10 < CC11.
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map(([control, { items, integrations }]) => ({
      control,
      items,
      integrations: [...integrations.values()],
    }));
}

const AI_ACT_ROWS: ReadonlyArray<{
  article: string;
  shortName: string;
  derivedFrom: ReadonlyArray<string>;
}> = [
  { article: "Article 9", shortName: "Risk management", derivedFrom: ["CC7", "CC8"] },
  { article: "Article 10", shortName: "Data governance", derivedFrom: ["C1"] },
  { article: "Article 11", shortName: "Technical documentation", derivedFrom: [] },
  { article: "Article 12", shortName: "Record-keeping (logging)", derivedFrom: ["CC7"] },
  { article: "Article 13", shortName: "Transparency to deployers", derivedFrom: ["CC8"] },
  { article: "Article 14", shortName: "Human oversight", derivedFrom: ["CC6"] },
  { article: "Article 15", shortName: "Accuracy · robustness · cybersecurity", derivedFrom: ["C1", "PI1"] },
  { article: "Article 17", shortName: "Quality management system", derivedFrom: ["CC8", "PI1"] },
  { article: "Article 26", shortName: "Deployer obligations (logging)", derivedFrom: ["CC7"] },
  { article: "Article 50", shortName: "Transparency for certain AI systems", derivedFrom: ["CC8"] },
];

export function ControlExplorer() {
  const [framework, setFramework] = useState<Framework>("soc2");
  const [filterSlug, setFilterSlug] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const soc2Rows = useMemo(() => buildSoc2Rows(), []);

  // (Removed: visibleIntegrations — Filter chips now resolve directly from
  // INTEGRATION_CATEGORIES → INTEGRATIONS_BY_SLUG, removing a redundant pass
  // over all INTEGRATIONS.)

  return (
    <div>
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Compliance framework"
        className="inline-flex rounded-lg border border-[#1C1C24] bg-[#111116] p-1"
      >
        {FRAMEWORKS.map((fw) => {
          const active = fw.key === framework;
          return (
            <button
              key={fw.key}
              type="button"
              id={`tab-${fw.key}`}
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${fw.key}`}
              onClick={() => {
                setFramework(fw.key);
                setExpanded(null);
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#0A0A0C] text-[#00D4AA]"
                  : "text-[#8B8B93] hover:text-[#F1F1F3]"
              }`}
            >
              {fw.label}
              <span className={`ml-2 text-[10px] font-normal uppercase tracking-[0.12em] ${active ? "text-[#00D4AA]/70" : "text-[#5C5C66]"}`}>
                {fw.knownTotal}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter chips grouped by category. Bloat reduction:
            • Inactive chips drop the bordered + heavy class strings (~120 chars
              each × 30 = ~3.6 KB removed from the SSR output).
            • Tighter padding (px-2.5 py-0.5) + smaller text (11px).
            • Category labels at 10px uppercase act as visual anchors so the
              30-chip surface goes from a flat 5-line strip to a labeled grid. */}
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C5C66]">
            Filter by integration
          </span>
          {filterSlug && (
            <button
              type="button"
              onClick={() => setFilterSlug(null)}
              className="text-[10px] uppercase tracking-[0.12em] text-[#00D4AA] hover:text-[#00B894]"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {INTEGRATION_CATEGORIES.map((cat) => (
            <div
              key={cat.label}
              role="group"
              aria-label={`${cat.label} integrations`}
              className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1"
            >
              <span className="w-24 shrink-0 text-[10px] uppercase tracking-[0.12em] text-[#4A4D4E]">
                {cat.label}
              </span>
              {cat.slugs.map((slug) => {
                const int = INTEGRATIONS_BY_SLUG[slug];
                if (!int) return null;
                const active = filterSlug === slug;
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => setFilterSlug(active ? null : slug)}
                    aria-pressed={active}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] transition-colors ${
                      active
                        ? "bg-[#00D4AA]/15 text-[#00D4AA]"
                        : "text-[#8B8B93] hover:text-[#F1F1F3]"
                    }`}
                  >
                    {int.name}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Control list */}
      <div
        role="tabpanel"
        id={`panel-${framework}`}
        aria-labelledby={`tab-${framework}`}
        className="mt-6 overflow-hidden rounded-xl border border-[#1C1C24] bg-[#111116]"
      >
        {framework === "soc2" ? (
          <Soc2Panel
            rows={soc2Rows}
            filterSlug={filterSlug}
            expanded={expanded}
            onToggle={(control) => setExpanded(expanded === control ? null : control)}
          />
        ) : (
          <AiActPanel
            rows={AI_ACT_ROWS}
            soc2Rows={soc2Rows}
            filterSlug={filterSlug}
            expanded={expanded}
            onToggle={(article) => setExpanded(expanded === article ? null : article)}
          />
        )}
      </div>

      {/* Bottom anchor to /features */}
      <div className="mt-6 text-center">
        <Link
          to="/features"
          className="inline-flex items-center text-sm font-medium text-[#00D4AA] hover:text-[#00B894] transition-colors"
        >
          See all evidence mapped to controls
          <ArrowRight />
        </Link>
      </div>
    </div>
  );
}

// ─── Panel: SOC 2 ────────────────────────────────────────────────────────────

function Soc2Panel({
  rows,
  filterSlug,
  expanded,
  onToggle,
}: {
  rows: Soc2Row[];
  filterSlug: string | null;
  expanded: string | null;
  onToggle: (control: string) => void;
}) {
  // Use the deduplicated `integrations` list for filtering so a single
  // integration matched once → row visible (was duplication-sensitive
  // when one integration emitted multiple evidence items for the row).
  const filtered = filterSlug
    ? rows.filter((r) => r.integrations.some((i) => i.slug === filterSlug))
    : rows;
  return (
    <table className="w-full text-left">
      <caption className="sr-only">
        SOC 2 controls covered by Spire integrations. Click a row to expand the evidence.
      </caption>
      <thead className="bg-[#0A0A0C] text-[10px] uppercase tracking-[0.12em] text-[#5C5C66]">
        <tr>
          <th scope="col" className="px-5 py-3 font-medium">Control ref</th>
          <th scope="col" className="px-5 py-3 font-medium">Integrations</th>
          <th scope="col" className="px-5 py-3 font-medium text-right">Evidence</th>
        </tr>
      </thead>
      <tbody>
        {filtered.length === 0 && (
          <tr>
            <td colSpan={3} className="px-5 py-6 text-center text-sm text-[#5C5C66]">
              No controls from this integration in the current dataset.
            </td>
          </tr>
        )}
        {filtered.map((row) => (
          <Soc2RowComponent
            key={row.control}
            row={row}
            isOpen={expanded === row.control}
            onToggle={() => onToggle(row.control)}
          />
        ))}
      </tbody>
    </table>
  );
}

function Soc2RowComponent({
  row,
  isOpen,
  onToggle,
}: {
  row: Soc2Row;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-t border-[#1C1C24] transition-colors hover:bg-[#0A0A0C] ${isOpen ? "bg-[#0A0A0C]" : ""}`}
        aria-expanded={isOpen}
      >
        <td className="px-5 py-3 font-mono text-sm text-[#F1F1F3]">{row.control}</td>
        {/* Collapsed state: UNIQUE integration names only (was duplicating
            per evidence item). Expanded state reveals the full evidence
            list below with attribution. */}
        <td className="px-5 py-3 text-sm text-[#8B8B93]">
          {row.integrations.map((i) => i.name).join(" · ")}
        </td>
        <td className="px-5 py-3 text-right text-sm">
          <span className={`inline-block transition-transform ${isOpen ? "rotate-90" : ""}`} aria-hidden>
            ›
          </span>
          <span className="ml-2 whitespace-nowrap text-[#5C5C66]">
            {row.integrations.length} integration{row.integrations.length === 1 ? "" : "s"} ·{" "}
            {row.items.length} item{row.items.length === 1 ? "" : "s"}
          </span>
        </td>
      </tr>
      <AnimatePresence initial={false}>
        {isOpen && (
          <tr>
            <td colSpan={3} className="bg-[#0A0A0C]/50 p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-[#1C1C24]"
              >
                <ul className="space-y-2.5 px-5 py-4 text-sm">
                  {row.items.map((item) => (
                    <li key={`${item.slug}-${item.text}`} className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00D4AA]" aria-hidden />
                      <span>
                        <span className="font-medium text-[#F1F1F3]">{item.name}</span>
                        <span className="text-[#8B8B93]"> — {item.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Panel: EU AI Act ────────────────────────────────────────────────────────

function AiActPanel({
  rows,
  soc2Rows,
  filterSlug,
  expanded,
  onToggle,
}: {
  rows: typeof AI_ACT_ROWS;
  soc2Rows: Soc2Row[];
  filterSlug: string | null;
  expanded: string | null;
  onToggle: (article: string) => void;
}) {
  const filtered = filterSlug
    ? rows.filter((r) => {
        const integrationCovers = r.derivedFrom.some((ctrl) => {
          const soc2 = soc2Rows.find((s) => s.control === ctrl);
          return soc2?.integrations.some((i) => i.slug === filterSlug);
        });
        return integrationCovers;
      })
    : rows;
  return (
    <table className="w-full text-left">
      <caption className="sr-only">
        EU AI Act articles Spire maps onto. Evidence may be partial while the framework mapping finalizes.
      </caption>
      <thead className="bg-[#0A0A0C] text-[10px] uppercase tracking-[0.12em] text-[#5C5C66]">
        <tr>
          <th scope="col" className="px-5 py-3 font-medium">Article</th>
          <th scope="col" className="px-5 py-3 font-medium">Topic</th>
          <th scope="col" className="px-5 py-3 font-medium text-right">Status</th>
        </tr>
      </thead>
      <tbody>
        {filtered.length === 0 && (
          <tr>
            <td colSpan={3} className="px-5 py-6 text-center text-sm text-[#5C5C66]">
              No EU AI Act articles currently map to this integration. The article set is enumerated independently of integrations.
            </td>
          </tr>
        )}
        {filtered.map((row) => {
          const linkedControls = row.derivedFrom
            .map((c) => soc2Rows.find((s) => s.control === c))
            .filter((s): s is Soc2Row => !!s);
          const integrationNames = filterSlug
            ? linkedControls
                .flatMap((s) => s.items)
                .filter((i) => i.slug === filterSlug)
                .map((i) => i.name)
            : [];
          const status = linkedControls.length === 0 ? "Pending mapping" : "Mapping emerging";
          const statusColor =
            status === "Pending mapping" ? "text-[#5C5C66]" : "text-[#F59E0B]";
          return (
            <Fragment key={row.article}>
              <tr
                onClick={() => onToggle(row.article)}
                className={`cursor-pointer border-t border-[#1C1C24] transition-colors hover:bg-[#0A0A0C] ${expanded === row.article ? "bg-[#0A0A0C]" : ""}`}
                aria-expanded={expanded === row.article}
              >
                <td className="px-5 py-3 font-mono text-sm text-[#F1F1F3]">{row.article}</td>
                <td className="px-5 py-3 text-sm text-[#8B8B93]">{row.shortName}</td>
                <td className="px-5 py-3 text-right text-sm">
                  <span className={`inline-block transition-transform ${expanded === row.article ? "rotate-90" : ""}`} aria-hidden>
                    ›
                  </span>
                  <span className={`ml-2 ${statusColor}`}>{status}</span>
                </td>
              </tr>
              <AnimatePresence initial={false}>
                {expanded === row.article && (
                  <tr>
                    <td colSpan={3} className="bg-[#0A0A0C]/50 p-0">
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-[#1C1C24]"
                      >
                        <div className="space-y-3 px-5 py-4 text-sm">
                          {linkedControls.length === 0 ? (
                            <p className="text-[#8B8B93]">
                              No SOC 2 control currently acts as the source row for this article. Final
                              mapping is on the audit roadmap; see <Link to="/trust-center" className="text-[#00D4AA] hover:text-[#00B894]">/trust-center</Link>{" "}
                              for the canonical posture statement.
                            </p>
                          ) : (
                            <>
                              <p className="text-[12px] uppercase tracking-[0.12em] text-[#5C5C66]">
                                Linked SOC 2 rows
                              </p>
                              <ul className="space-y-2">
                                {linkedControls.map((ctrl) => {
                                  const relevantItems = filterSlug
                                    ? ctrl.items.filter((i) => i.slug === filterSlug)
                                    : ctrl.items;
                                  return (
                                    <li key={ctrl.control} className="flex items-start gap-3">
                                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00D4AA]" aria-hidden />
                                      <span>
                                        <span className="font-mono font-medium text-[#F1F1F3]">{ctrl.control}</span>
                                        <span className="text-[#8B8B93]"> · {relevantItems.map((i) => `${i.name}: ${i.text}`).join("  ·  ")}</span>
                                        {filterSlug && integrationNames.length > 0 && (
                                          <span className="ml-1 text-[#5C5C66]"> (filtered to {integrationNames.join(", ")})</span>
                                        )}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </>
                          )}
                          <p className="text-xs text-[#5C5C66]">
                            Framework mapping is partial. EU AI Act compliance posture next reviewed in
                            <time dateTime="2026-09-30" className="ml-1 text-[#8B8B93]">Q3 2026</time>.
                          </p>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
