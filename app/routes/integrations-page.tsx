import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { StructuredData } from "~/components/structured-data";
import { integrationsItemListSchema, breadcrumbListSchema } from "~/lib/structured-data";
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
    { title: `Integrations | Spire: ${TOTAL_COUNT} read-only OAuth integrations` },
    {
      name: "description",
      content: `Spire connects to ${TOTAL_COUNT} production systems via read-only OAuth - GitHub, Stripe, Cloudflare, Neon, Datadog, and more - for automated SOC 2 and EU AI Act evidence collection.`,
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
      <StructuredData schemas={breadcrumbListSchema([
        { name: "Home", url: "/" },
        { name: "Integrations", url: "/integrations" },
      ])} />

      {/* ─── HERO ─── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
            {TOTAL_COUNT} read-only integrations,<br />
            <span className="text-brand">grouped by what they actually prove</span>
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            We connect to your existing tools via read-only APIs - no agents, no sidecars, no
            config to maintain. Each integration maps evidence to specific SOC 2 common criteria
            or EU AI Act articles; click any row to see the full evidence list.
          </p>
        </div>
      </section>

      {/* ─── CATEGORIZED DIRECTORY ─── */}
      <section className="border-t border-border-primary py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-xl border border-border-primary bg-surface-secondary">
            {CATEGORY_ROWS.map((cat, i) => (
              <div
                key={cat.label}
                className={`px-6 py-5 ${i === 0 ? "" : "border-t border-border-primary"}`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                    {cat.label}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-text-tertiary">
                    {cat.items.length} integration{cat.items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <ul className="mt-3 grid gap-x-8 gap-y-2 md:grid-cols-2">
                  {cat.items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        to={`/integrations/${item.slug}`}
                        aria-label={`View ${item.name} integration details`}
                        className="group flex items-baseline gap-2 py-1.5 text-sm text-text-primary hover:text-brand transition-colors"
                      >
                        <span className="font-medium">{item.name}</span>
                        <span className="text-text-tertiary">-</span>
                        <span className="text-text-secondary group-hover:text-text-secondary transition-colors">
                          {item.description}
                        </span>
                        <span
                          aria-hidden="true"
                          className="ml-auto shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-brand"
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
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-border-primary py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">
              Don't see what you need?
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Tell us which tool is blocking your audit and we'll prioritise it.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex h-11 items-center rounded-[20px] border border-border-primary px-6 text-sm font-medium text-text-secondary transition-all hover:border-brand/40 hover:text-text-primary hover:scale-[0.97] active:scale-[0.95]"
            >
              Suggest an integration
              <svg className="ml-1 inline-block h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 8h10m-3-4 4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
