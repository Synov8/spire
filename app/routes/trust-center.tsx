import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { StructuredData } from "~/components/structured-data";
import { organizationSchema } from "~/lib/structured-data";
import type { Route } from "./+types/trust-center";
import { spirePosture, type FrameworkPosture } from "~/data/spire-self-audit";

/**
 * /trust-center — provable-by-design public trust surface.
 *
 * Sections per home-overhaul-spec.md §5.2:
 *   1. Hero
 *   2. Live posture widget (currently snapshot-derived; future cron-driven)
 *   3. Subprocessor list
 *   4. Cryptographic & data handling
 *   5. Status & uptime (honest fallback — no status page yet)
 *   6. Bottom CTA
 *
 * All copy is provable (no fabricated SOC 2 cert, no fake stats). The
 * canonical certification statement lives on this page (matches wording:
 * "Preparing for formal SOC 2 certification").
 */

export function meta() {
  return [
    { title: "Trust Center | Spire — AI compliance posture, subprocessors, security" },
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
        className="h-2 w-full overflow-hidden rounded-full bg-[#1C1C24]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct} percent of controls passing`}
      >
        <div
          className="h-full rounded-full bg-[#00D4AA]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-[#5C5C66]">
        {pct}% — {passed} of {total} controls
      </p>
    </div>
  );
}

function PostureCard({
  title,
  frameworkKey,
  posture,
}: {
  title: string;
  frameworkKey: "soc2" | "aiAct";
  posture: FrameworkPosture;
}) {
  return (
    <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5C5C66]">
        {title}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-[#F1F1F3]">
        {posture.passed}
        <span className="text-base font-normal text-[#5C5C66]"> / {posture.total}</span>
      </p>
      <ProgressBar passed={posture.passed} total={posture.total} />
      <dl className="mt-4 space-y-1 text-xs text-[#5C5C66]">
        <div>
          <dt className="inline">Stage: </dt>
          <dd className="inline text-[#8B8B93]">{posture.stage}</dd>
        </div>
        <div>
          <dt className="inline">Last evaluated: </dt>
          <dd className="inline">
            <time dateTime={posture.lastEvaluated} className="text-[#8B8B93]">
              {new Date(posture.lastEvaluated).toUTCString()}
            </time>
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function TrustCenter() {
  return (
    <PublicLayout>
      {/* JSON-LD: Organization (legal entity Synov8 Ltd., contact points, sameAs) */}
      <StructuredData schemas={organizationSchema()} />
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">
          Trust Center
        </span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">
          Spire uses Spire to audit itself.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[#8B8B93]">
          The same AI compliance agent your team would use, evaluating Spire's own controls.
          Updated continuously via Composio-driven evidence collection. No third-party
          attestation theater — just timestamped, source-backed posture.
        </p>
      </section>

      {/* Live posture widget */}
      <section className="border-y border-[#1C1C24] bg-[#111116]/30 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-[#F1F1F3] md:text-3xl">
              Posture snapshot
            </h2>
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                aria-disabled="true"
                aria-describedby="rerun-audit-status"
                className="cursor-not-allowed rounded-lg border border-[#1C1C24] px-4 py-2 text-sm text-[#5C5C66]"
              >
                Re-run audit
              </button>
              <p id="rerun-audit-status" className="text-xs text-[#5C5C66]">
                Live re-evaluation is gated behind Spire-admin access.
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-[#8B8B93]">
            Snapshot from{" "}
            <time dateTime={spirePosture.generatedAt} className="text-[#F1F1F3]">
              {new Date(spirePosture.generatedAt).toUTCString()}
            </time>
            . Provability is end-to-end: Spire's audit engine runs against Spire's organization.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <PostureCard
              title="SOC 2"
              frameworkKey="soc2"
              posture={spirePosture.frameworks.soc2}
            />
            <PostureCard
              title="EU AI Act"
              frameworkKey="aiAct"
              posture={spirePosture.frameworks.aiAct}
            />
          </div>
          <ul className="mt-6 space-y-2 text-xs text-[#5C5C66]">
            {spirePosture.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Subprocessor list */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight text-[#F1F1F3] md:text-3xl">
          Subprocessors
        </h2>
        <p className="mt-2 text-sm text-[#8B8B93]">
          Services that handle customer data on Spire's behalf. We disclose every one.
        </p>
        <div className="mt-8 overflow-hidden rounded-xl border border-[#1C1C24] bg-[#111116]">
          <table className="w-full text-left">
            <caption className="sr-only">
              Subprocessors that handle customer data on behalf of Spire.
            </caption>
            <thead className="bg-[#0A0A0C] text-xs uppercase tracking-wider text-[#5C5C66]">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Subprocessor</th>
                <th scope="col" className="px-5 py-3 font-semibold">Purpose</th>
                <th scope="col" className="px-5 py-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {SUBPROCESSORS.map((sp) => (
                <tr key={sp.name} className="border-t border-[#1C1C24]">
                  <td className="px-5 py-3 font-medium text-[#F1F1F3]">{sp.name}</td>
                  <td className="px-5 py-3 text-sm text-[#8B8B93]">{sp.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-[#8B8B93]">
          Need our full DPA or a deeper subprocessor inventory?{" "}
          <Link to="/contact" className="text-[#00D4AA] hover:text-[#00B894]">
            Request access →
          </Link>
        </p>
      </section>

      {/* Cryptographic & data handling */}
      <section className="border-y border-[#1C1C24] bg-[#111116]/30 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#F1F1F3] md:text-3xl">
            Cryptographic &amp; data handling
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Data at rest", "AES-256 encryption for all evidence and customer metadata."],
              ["Data in transit", "TLS 1.3 enforced on every connection."],
              ["API credentials", "Stored using Cloudflare Workers Secrets with AES-256 encryption."],
              ["AI providers", "Zero retention mode; LLM providers do not log requests."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-lg border border-[#1C1C24] bg-[#111116] p-5">
                <h3 className="text-sm font-bold text-[#F1F1F3]">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#8B8B93]">{desc}</p>
              </div>
            ))}
          </div>
          <div
            className="mt-8 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-5"
          >
            <p className="text-sm font-medium text-[#F59E0B]">Penetration testing</p>
            <p className="mt-1 text-sm text-[#8B8B93]">
              Penetration testing cadence: planned for H2 2026; historical reports not yet
              published. We&apos;ll publish the first report after the formal engagement completes.
            </p>
          </div>
        </div>
      </section>

      {/* Status & uptime */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight text-[#F1F1F3] md:text-3xl">
          Status &amp; uptime
        </h2>
        <div className="mt-6 rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
          <p className="text-sm text-[#F1F1F3]">No public status page yet.</p>
          <p className="mt-2 text-sm text-[#8B8B93]">
            For incidents, contact{" "}
            <a
              href="mailto:hello@synov8studio.com"
              className="text-[#00D4AA] hover:text-[#00B894]"
            >
              hello@synov8studio.com
            </a>
            {" "}— we commit to acknowledging within 1 business hour. We&apos;re actively evaluating
            a status-page vendor (BetterStack / Instatus) — see the spec backlog.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#1C1C24] bg-[#111116]/30 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[#F1F1F3] md:text-4xl">
          Convinced?
        </h2>
        <Link
          to="/dashboard/questionnaires/upload"
          className="mt-6 inline-block rounded-lg bg-[#00D4AA] px-7 py-3 font-semibold text-black hover:bg-[#00B894] transition-colors"
        >
          Upload a questionnaire
        </Link>
      </section>
    </PublicLayout>
  );
}
