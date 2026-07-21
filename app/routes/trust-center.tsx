import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { StructuredData } from "~/components/structured-data";
import { organizationSchema, breadcrumbListSchema } from "~/lib/structured-data";
import { spirePosture, type FrameworkPosture } from "~/data/spire-self-audit";

/**
 * /trust-center - provable-by-design public trust surface.
 *
 * Sections per home-overhaul-spec.md §5.2:
 *   1. Hero
 *   2. Live posture widget (currently snapshot-derived; future cron-driven)
 *   3. Subprocessor list
 *   4. Cryptographic & data handling
 *   5. Status & uptime (https://status.spire.synov8studio.com)
 *   6. Bottom CTA
 *
 * All copy is provable (no fabricated SOC 2 cert, no fake stats). The
 * canonical certification statement lives on this page (matches wording:
 * "Preparing for formal SOC 2 certification").
 */

export function meta() {
  return [
    { title: "Trust Center | Spire: AI compliance posture, subprocessors, security" },
    {
      name: "description",
      content: "Spire's own compliance posture, subprocessors, encryption standards, and uptime commitments. Spire uses Spire to audit itself.",
    },
    { property: "og:title", content: "Trust Center | Spire" },
    { property: "og:description", content: "Provable security and compliance posture for Spire." },
    { property: "og:type", content: "website" },
  ];
}

const SUBPROCESSORS: ReadonlyArray<{
  name: string;
  purpose: string;
  notes: string;
}> = [
  {
    name: "Cloudflare",
    purpose: "Edge compute & hosting",
    notes: "Workers + Pages deploy globally; US/EU regions available.",
  },
  {
    name: "Neon",
    purpose: "Postgres hosting",
    notes: "Hosted on AWS. Neon is SOC 2 certified; Spire's own certification status is documented on this page.",
  },
  {
    name: "OpenRouter / AI SDK",
    purpose: "AI inference routing",
    notes: "Zero retention mode for customer data; AI providers do not log requests.",
  },
  {
    name: "Resend",
    purpose: "Transactional email",
    notes: "Magic links, invitations, and security notifications.",
  },
  {
    name: "Stripe",
    purpose: "Payments & billing",
    notes: "Subscription handling via Better Auth Stripe plugin.",
  },
];

function ProgressBar({ passed, total }: { passed: number; total: number }): React.ReactElement {
  const pct = Math.round((passed / total) * 100);
  return (
    <div className="mt-3">
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-border-border-primary"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct} percent of controls passing`}
      >
        <div
          className="h-full rounded-full bg-brand"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-text-tertiary">
        {pct}% - {passed} of {total} controls
      </p>
    </div>
  );
}

function PostureCard({ title, passed, total }: { title: string; passed: number; total: number }) {
  return (
    <div className="rounded-xl border border-border-primary bg-surface-secondary p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-tertiary">
        {title}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-text-primary">
        {passed}
        <span className="text-base font-normal text-text-tertiary"> / {total}</span>
      </p>
      <ProgressBar passed={passed} total={total} />
    </div>
  );
}

export default function TrustCenter() {
  return (
    <PublicLayout>
      {/* JSON-LD: Organization (legal entity Synov8 Ltd., contact points, sameAs) */}
      <StructuredData schemas={organizationSchema()} />
      <StructuredData schemas={breadcrumbListSchema([
        { name: "Home", url: "/" },
        { name: "Trust Center", url: "/trust-center" },
      ])} />
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-32 pb-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
          Spire uses Spire to audit itself.
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-text-secondary">
          The same AI compliance agent your team would use, evaluating Spire's own controls.
          Updated continuously via automated evidence collection. No third-party
          attestation theater - just timestamped, source-backed posture.
        </p>
      </section>

      {/* Live posture widget */}
      <section className="border-y border-border-primary bg-surface-secondary py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
              Posture snapshot
            </h2>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Snapshot from{" "}
            <time dateTime={spirePosture.generatedAt} className="text-text-primary">
              {new Date(spirePosture.generatedAt).toUTCString()}
            </time>
            . Provability is end-to-end: Spire's audit engine runs against Spire's organization.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <PostureCard title="SOC 2" passed={spirePosture.frameworks.soc2.passed} total={spirePosture.frameworks.soc2.total} />
            <PostureCard title="EU AI Act" passed={spirePosture.frameworks.aiAct.passed} total={spirePosture.frameworks.aiAct.total} />
          </div>
        </div>
      </section>

      {/* Subprocessor list */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
          Subprocessors
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Services that handle customer data on Spire's behalf. We disclose every one.
        </p>
        <div className="mt-8 overflow-hidden rounded-xl border border-border-primary bg-surface-secondary">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Subprocessors that handle customer data on behalf of Spire.
            </caption>
            <thead className="bg-surface-primary text-xs uppercase tracking-wider text-text-tertiary">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Subprocessor</th>
                <th scope="col" className="px-5 py-3 font-semibold">Purpose</th>
                <th scope="col" className="px-5 py-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {SUBPROCESSORS.map((sp) => (
                <tr key={sp.name} className="border-t border-border-primary">
                  <td className="px-5 py-3 font-medium text-text-primary">{sp.name}</td>
                  <td className="px-5 py-3 text-text-secondary">{sp.purpose}</td>
                  <td className="px-5 py-3 text-text-secondary">{sp.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-text-secondary">
          Need our full DPA or a deeper subprocessor inventory?{" "}
          <Link to="/contact" className="text-brand hover:text-brand-dark">
            Request access &rarr;
          </Link>
        </p>
      </section>

      {/* Cryptographic & data handling */}
      <section className="border-y border-border-primary bg-surface-secondary py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            Cryptographic &amp; data handling
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Data at rest", "AES-256 encryption for all evidence and customer metadata."],
              ["Data in transit", "TLS 1.3 enforced on every connection."],
              ["API credentials", "Stored using Cloudflare Workers Secrets with AES-256 encryption."],
              ["AI providers", "Zero retention mode; LLM providers do not log requests."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl border border-border-primary bg-surface-secondary p-5">
                <h3 className="text-sm font-bold text-text-primary">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status & uptime */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
          Status &amp; uptime
        </h2>
        <div className="mt-6 rounded-xl border border-border-primary bg-surface-secondary p-6">
          <p className="text-sm text-text-primary">
            <a href="https://status.spire.synov8studio.com" target="_blank" rel="noopener"
              className="text-brand hover:text-brand-dark underline underline-offset-2"
            >status.spire.synov8studio.com</a>
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Live status of Spire's infrastructure dependencies. For incidents, contact{" "}
            <a
              href="mailto:hello@synov8studio.com"
              className="text-brand hover:text-brand-dark"
            >
              hello@synov8studio.com
            </a>
            {" "}- we commit to acknowledging within 1 business hour.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border-primary bg-surface-secondary py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          Convinced?
        </h2>
        <Link
          to="/dashboard/questionnaires/upload"
          className="mt-6 inline-flex h-11 items-center rounded-[20px] bg-brand px-7 text-sm font-semibold text-black transition-all hover:bg-brand-dark hover:scale-[0.97] active:scale-[0.95]"
        >
          Upload a questionnaire
        </Link>
      </section>
    </PublicLayout>
  );
}
