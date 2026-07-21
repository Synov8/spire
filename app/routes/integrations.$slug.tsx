import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { StructuredData } from "~/components/structured-data";
import { integrationServiceSchema, breadcrumbListSchema } from "~/lib/structured-data";
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
    { title: `${name} integration | Spire - automated SOC 2 & EU AI Act evidence` },
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
        schemas={[
          integrationServiceSchema(
            integration.slug,
            integration.name,
            integration.description,
          ),
          breadcrumbListSchema([
            { name: "Home", url: "/" },
            { name: "Integrations", url: "/integrations" },
            { name: integration.name, url: `/integrations/${integration.slug}` },
          ]),
        ]}
      />

      {/* Section 1: Hero band — side-by-side layout */}
      <section className="border-b border-border-primary bg-surface-secondary/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-24 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-5">
            <div
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-3xl font-bold text-brand"
            >
              {integration.name[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
                {integration.name}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-text-secondary">
                {integration.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link
              to={connectHref}
              className="inline-flex h-11 items-center rounded-[20px] bg-brand px-6 text-sm font-semibold text-black transition-all hover:bg-brand-dark hover:scale-[0.97] active:scale-[0.95]"
            >
              Connect now
            </Link>
            <p className="text-xs text-text-tertiary">
              Read-only · scope can be revoked any time
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Why auditors care — centered narrow prose */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            Why auditors care
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">
            {integration.description} Spire probes its API on a continuous basis, and synthesizes
            each call into an evidence object mapped to a specific SOC 2 control or EU AI Act article.
            Auditors see timestamped, source-backed data, not screenshots or hand-curated exports.
          </p>
        </div>
      </section>

      {/* Section 3: Evidence and controls — full-width table band */}
      <section className="border-y border-border-primary bg-surface-secondary/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            Evidence collected and controls covered
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {integration.evidence.length} evidence item
            {integration.evidence.length === 1 ? "" : "s"} mapped to SOC 2 / EU AI Act controls.
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border border-border-primary bg-surface-secondary">
            <table className="w-full text-left">
              <caption className="sr-only">
                Evidence collected from {integration.name}, mapped to SOC 2 and EU AI Act controls.
              </caption>
              <thead className="bg-surface-primary text-xs uppercase tracking-wider text-text-tertiary">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Control
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Evidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {integration.evidence.map((e) => (
                  <tr
                    key={`${e.text}-${e.control ?? "x"}`}
                    className="border-t border-border-primary transition-colors hover:bg-surface-primary/50"
                  >
                    <td className="px-5 py-3 font-mono text-sm text-brand">
                      {e.control ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-sm text-text-primary">{e.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 4: Credential security — centered intro + feature card grid */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
              Read-only API access, scoped and revocable
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-text-secondary">
              We connect to {integration.name} via a read-only API access token, brokered and managed
              on our side. Spire never writes to your {integration.name} account, and the credential
              can be revoked from the integration settings page at any time. The token is encrypted at
              rest with AES-256 and never logged.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border-primary bg-surface-secondary p-6">
              <div
                aria-hidden="true"
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-sm font-bold text-brand"
              >
                01
              </div>
              <h3 className="text-lg font-bold text-text-primary">Read-only access</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Spire connects via a read-only token. We never modify your {integration.name}{" "}
                account or data.
              </p>
            </div>
            <div className="rounded-xl border border-border-primary bg-surface-secondary p-6">
              <div
                aria-hidden="true"
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-sm font-bold text-brand"
              >
                02
              </div>
              <h3 className="text-lg font-bold text-text-primary">Encrypted at rest</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Your credential is encrypted with AES-256 before storage and is never written to
                server logs or application traces.
              </p>
            </div>
            <div className="rounded-xl border border-border-primary bg-surface-secondary p-6">
              <div
                aria-hidden="true"
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-sm font-bold text-brand"
              >
                03
              </div>
              <h3 className="text-lg font-bold text-text-primary">Revocable anytime</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                You can revoke the token from integration settings at any time. Data collection
                stops immediately and no further API calls are made.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Related integrations — card grid */}
      <section className="border-t border-border-primary bg-surface-secondary/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            Related integrations
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/integrations/${r.slug}`}
                className="rounded-xl border border-border-primary bg-surface-secondary p-6 transition-colors hover:border-brand"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-lg font-bold text-brand">
                  {r.name[0]}
                </div>
                <h3 className="mt-4 text-lg font-bold text-text-primary">{r.name}</h3>
                <p className="mt-1 text-sm text-text-secondary">{r.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Footer CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Link
            to="/integrations"
            className="inline-flex h-11 items-center rounded-[20px] border border-border-primary px-6 text-sm font-medium text-text-secondary transition-all hover:border-brand/40 hover:text-text-primary hover:scale-[0.97] active:scale-[0.95]"
          >
            Connect all your tools →
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
