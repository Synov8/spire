import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { StructuredData } from "~/components/structured-data";
import { integrationServiceSchema } from "~/lib/structured-data";
import { INTEGRATIONS, INTEGRATIONS_BY_SLUG } from "~/lib/integration-data";
import { auth } from "~/lib/auth.server";
import type { Route } from "./+types/integrations.$slug";

/**
 * Per-integration landing page.
 *
 * Loader:
 *   - look up INTEGRATIONS_BY_SLUG[params.slug]
 *   - throw a 404 Response if not found (lets React Router 8 render the
 *     nearest ErrorBoundary / status-bar with the right HTTP code for SEO)
 *   - also returns {signedIn, related} so the page can render Connect-now
 *     with the right target and show 3 sibling integration cards.
 *
 * Spec: home-overhaul-spec.md §5.1.
 */
export function meta({ params }: Route.MetaArgs) {
  // Look up the integration directly from the canonical fixture rather than
  // passing through loaderData — this codebase's RR 8 build does not forward
  // `data` to meta (compare home.tsx, which uses a no-arg meta signature).
  const matched = INTEGRATIONS_BY_SLUG[params.slug];
  if (!matched) {
    return [
      { title: "Integration not found | Spire" },
      { name: "robots", content: "noindex" },
    ];
  }
  const name = matched.name;
  return [
    { title: `${name} integration | Spire — automated SOC 2 & EU AI Act evidence` },
    {
      name: "description",
      content: `Spire connects to ${name} via secure read-only OAuth and continuously collects audit-ready evidence mapped to SOC 2 and EU AI Act controls.`,
    },
    { property: "og:title", content: `${name} integration | Spire` },
    { property: "og:description", content: `Continuous ${name} evidence for SOC 2 and EU AI Act.` },
    { property: "og:type", content: "website" },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const integration = INTEGRATIONS_BY_SLUG[params.slug];
  if (!integration) throw new Response("Integration not found", { status: 404 });

  const session = await auth.api.getSession({ headers: request.headers });
  const related = INTEGRATIONS.filter((i) => i.slug !== params.slug).slice(0, 3);

  return { integration, signedIn: !!session, related };
}

export default function IntegrationSlugPage({ loaderData }: Route.ComponentProps) {
  const { integration, signedIn, related } = loaderData;
  const connectHref = signedIn ? "/dashboard/integrations" : "/login";

  return (
    <PublicLayout>
      {/* JSON-LD: per-integration Service schema (bonus — pins each integration as a discoverable Thing). */}
      <StructuredData
        schemas={integrationServiceSchema(
          integration.slug,
          integration.name,
          integration.description,
        )}
      />
      {/* Hero band — small (logo + name + desc + Connect now) */}
      <section className="border-b border-[#1C1C24] bg-[#111116]/30">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-5">
            <div
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#00D4AA]/10 text-3xl font-bold text-[#00D4AA]"
            >
              {integration.name[0]}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5C5C66]">
                Integration
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#F1F1F3] md:text-4xl">
                {integration.name}
              </h1>
              <p className="mt-2 text-lg leading-relaxed text-[#8B8B93]">
                {integration.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link
              to={connectHref}
              className="rounded-lg bg-[#00D4AA] px-6 py-3 font-semibold text-black hover:bg-[#00B894] transition-colors"
            >
              Connect now
            </Link>
            <p className="text-xs text-[#5C5C66]">
              Read-only · scope can be revoked any time
            </p>
          </div>
        </div>
      </section>

      {/* Why auditors care — short prose */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight text-[#F1F1F3] md:text-3xl">
          Why auditors care
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[#8B8B93]">
          {integration.description} Spire probes its API on a continuous basis, and synthesizes
          each call into an evidence object mapped to a specific SOC 2 control or EU AI Act article —
          auditors see timestamped, source-backed data, not screenshots or hand-curated exports.
        </p>
      </section>

      {/* Evidence & controls — sortable table */}
      <section className="border-y border-[#1C1C24] bg-[#111116]/30 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#F1F1F3] md:text-3xl">
            Evidence collected and controls covered
          </h2>
          <p className="mt-2 text-sm text-[#8B8B93]">
            {integration.evidence.length} evidence item{integration.evidence.length === 1 ? "" : "s"} mapped to SOC 2 / EU AI Act controls.
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border border-[#1C1C24] bg-[#111116]">
            <table className="w-full text-left">
              <caption className="sr-only">
                Evidence collected from {integration.name}, mapped to SOC 2 and EU AI Act controls.
              </caption>
              <thead className="bg-[#0A0A0C] text-xs uppercase tracking-wider text-[#5C5C66]">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Control</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {integration.evidence.map((e) => (
                  <tr
                    key={`${e.text}-${e.control ?? "x"}`}
                    className="border-t border-[#1C1C24] transition-colors hover:bg-[#0A0A0C]/50"
                  >
                    <td className="px-5 py-3 font-mono text-sm text-[#00D4AA]">
                      {e.control ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#F1F1F3]">{e.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Credential security */}
      <section aria-label="Credential security" className="mx-auto max-w-5xl px-6 py-16">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">
          Credential security
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#F1F1F3] md:text-3xl">
          Read-only API access, scoped and revocable
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[#8B8B93]">
          We connect to {integration.name} via a read-only API access token, brokered and managed on our side. Spire never writes to your{" "}
          {integration.name} account, and the credential can be revoked from the integration settings
          page at any time. The token is encrypted at rest with AES-256 and never logged.
        </p>
      </section>

      {/* Related integrations */}
      <section className="border-t border-[#1C1C24] bg-[#111116]/30 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#F1F1F3] md:text-3xl">
            Related integrations
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/integrations/${r.slug}`}
                className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6 transition-colors hover:border-[#00D4AA]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00D4AA]/10 text-lg font-bold text-[#00D4AA]">
                  {r.name[0]}
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#F1F1F3]">{r.name}</h3>
                <p className="mt-1 text-sm text-[#8B8B93]">{r.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <Link
          to="/integrations"
          className="text-sm font-medium text-[#00D4AA] hover:text-[#00B894] transition-colors"
        >
          Connect all your tools →
        </Link>
      </section>
    </PublicLayout>
  );
}
