import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { StructuredData } from "~/components/structured-data";
import { integrationsItemListSchema } from "~/lib/structured-data";
import {
  INTEGRATION_CATEGORIES,
  INTEGRATIONS,
  INTEGRATIONS_BY_SLUG,
} from "~/lib/integration-data";

// Build the categorized directory. Each category iterates its slug list,
// resolving to the canonical Integration record via INTEGRATIONS_BY_SLUG.
// Missing slugs are silently skipped against the dev-time warning at
// module init in integration-data.ts.
function buildCategoryRows() {
  return INTEGRATION_CATEGORIES.map((cat) => ({
    label: cat.label,
    items: cat.slugs.flatMap((slug) => {
      const int = INTEGRATIONS_BY_SLUG[slug];
      return int ? [{ slug: int.slug, name: int.name, description: int.description }] : [];
    }),
  }));
}

const CATEGORY_ROWS = buildCategoryRows();
const TOTAL_COUNT = INTEGRATIONS.length;

export function meta() {
  return [
    { title: `Integrations | Spire — ${TOTAL_COUNT} read-only OAuth integrations` },
    {
      name: "description",
      content: `Spire connects to ${TOTAL_COUNT} production systems via read-only OAuth — AWS, GitHub, Stripe, Okta, Datadog, and more — for automated SOC 2 and EU AI Act evidence collection.`,
    },
    { property: "og:title", content: "Integrations | Spire" },
    { property: "og:type", content: "website" },
  ];
}

function ArrowRight() {
  return (
    <svg className="ml-1 inline-block h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 8h10m-3-4 4 4-4 4" />
    </svg>
  );
}

export default function IntegrationsPage() {
  return (
    <PublicLayout>

      {/* JSON-LD: ItemList of all integrations (each ListItem embeds nested Service) */}
      <StructuredData schemas={integrationsItemListSchema()} />

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Integrations</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">
            {TOTAL_COUNT} read-only integrations,<br />
            <span className="text-[#00D4AA]">grouped by what they actually prove</span>
          </h1>
          <p className="mt-4 text-lg text-[#8B8B93]">
            We connect to your existing tools via read-only APIs — no agents, no sidecars, no config to maintain. Each integration maps evidence to specific SOC 2 common criteria or EU AI Act articles; click any row to see the full evidence list.
          </p>
        </div>

        {/* Categorized directory — 8 sections matching the homepage coverage
            table's filter-chip layout. Each row is a slim link to the
            per-integration deep-dive page (where the full evidence & controls
            table lives) rather than duplicating the bullet list here. */}
        <div className="mt-16 rounded-xl border border-[#1C1C24] bg-[#111116]">
          {CATEGORY_ROWS.map((cat, i) => (
            <div
              key={cat.label}
              className={`px-6 py-5 ${i === 0 ? "" : "border-t border-[#1C1C24]"}`}
            >
              <div className="flex items-baseline justify-between">
                <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4A4D4E]">
                  {cat.label}
                </span>
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#5C5C66]">
                  {cat.items.length} integration{cat.items.length === 1 ? "" : "s"}
                </span>
              </div>
              <ul className="mt-3 grid gap-x-8 gap-y-2 md:grid-cols-2">
                {cat.items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={`/integrations/${item.slug}`}
                      aria-label={`View ${item.name} integration details`}
                      className="group flex items-baseline gap-2 py-1.5 text-sm text-[#F1F1F3] hover:text-[#00D4AA] transition-colors"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-[#5C5C66] group-hover:text-[#6A6D6E] transition-colors">
                        —
                      </span>
                      <span className="text-[#8B8B93] group-hover:text-[#8B8B93] transition-colors">
                        {item.description}
                      </span>
                      <span
                        aria-hidden="true"
                        className="ml-auto shrink-0 text-[#5C5C66] opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-[#00D4AA]"
                      >
                        <ArrowRight />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Don't see what you need?</h2>
          <p className="mt-2 text-sm text-[#8B8B93]">Tell us which tool is blocking your audit and we'll prioritise it.</p>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center rounded-lg border border-[#1A1D1E] bg-transparent px-6 py-3 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA]/40 hover:text-[#00D4AA] transition-colors"
          >
            Suggest an integration
            <svg className="ml-1 inline-block h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 8h10m-3-4 4 4-4 4" />
            </svg>
          </Link>
        </div>
      </section>

    </PublicLayout>
  );
}
