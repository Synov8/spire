import { INTEGRATION_NAMES } from "~/lib/integration-data";

/**
 * Trust strip — provable-by-design "social proof" band.
 *
 * Replaces the marketing-asset approach (fake customer logos) with the
 * only claims we can back with source code:
 *   - Layer 1 (left): 9 integration names as plain text labels with ` · ` separators.
 *   - Layer 2 (right): 4 listing / community badges Spire is enrolled in.
 *
 * Typographic rhythm (verified against `app/routes/home.tsx` hero):
 *   - Hero subheadline:  `text-lg   leading-relaxed            text-[#8B8B93]`
 *   - Section meta-label: `text-[10px] uppercase tracking-[0.15em] text-[#5C5C66]`
 *   - Integration row:    `text-sm   tracking-wide              text-[#8B8B93]`
 *
 * The integration row shares the hero subheadline's muted color (#8B8B93)
 * but at smaller size (sm vs lg) with wider tracking — typographic cousin,
 * not competing weight.
 *
 * See home-overhaul-spec.md §4.3 + §16 Trademark guard.
 *
 * IMPORTANT: do not add brand logomarks here without checking the §16
 * matrix first. AWS, Vercel, Cloudflare, and Stripe wordmarks are blocked.
 */

const LISTING_BADGES: ReadonlyArray<{
  label: string;
  href: string;
  title: string;
}> = [
  {
    label: "Tiny Startups",
    href: "https://www.tinystartups.com/startup/spire",
    title: "Featured on Tiny Startups",
  },
  {
    label: "Product Hunt",
    href: "https://www.producthunt.com/products/spire-6?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-spire-6",
    title: "Spire on Product Hunt",
  },
  {
    label: "SideProjectors",
    href: "https://www.sideprojectors.com/project/84002/spire",
    title: "Spire on SideProjectors",
  },
  {
    label: "SaaS Cubes",
    href: "https://saascubes.com",
    title: "Listed on SaaS Cubes",
  },
];

export function TrustStrip() {
  return (
    <section aria-label="Trust signals" className="border-y border-[#1C1C24] bg-[#111116]/50 py-10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
          {/* Layer 1: integrations — all-text labels (no marks) */}
          <div className="text-center lg:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5C5C66]">
              Connects to
            </p>
            <p className="mt-2 text-sm tracking-wide text-[#8B8B93]">
              {INTEGRATION_NAMES.join(" · ")}
            </p>
          </div>

          {/* Layer 2: launch / listing programs Spire is enrolled in */}
          <div className="text-center lg:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5C5C66]">
              As seen on
            </p>
            <p className="mt-2 flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-sm tracking-wide text-[#8B8B93] lg:justify-end">
              {LISTING_BADGES.map((b, i) => (
                <span key={b.href} className="contents">
                  <a
                    href={b.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={b.title}
                    className="text-[#8B8B93] hover:text-[#F1F1F3] transition-colors"
                  >
                    {b.label}
                  </a>
                  {i < LISTING_BADGES.length - 1 && (
                    <span aria-hidden="true" className="text-[#5C5C66]">·</span>
                  )}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
