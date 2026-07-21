import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { StructuredData } from "~/components/structured-data";
import { breadcrumbListSchema } from "~/lib/structured-data";
import { INTEGRATION_NAMES } from "~/lib/integration-data";

export function meta() {
  return [
    {
      title: `Features | Spire - ${INTEGRATION_NAMES.length} integrations, 66 mapped controls`,
    },
    {
      name: "description",
      content: `Spire connects to ${INTEGRATION_NAMES.length} production systems via read-only OAuth. Collects SOC 2 and EU AI Act evidence continuously. AI compliance agent runs on-demand audits. Auto-fills security questionnaires. One-click evidence export.`,
    },
    { property: "og:title", content: "Features | Spire" },
    { property: "og:type", content: "website" },
  ];
}

const features = [
  {
    title: "Continuous evidence from your stack",
    desc: `Read-only OAuth - no agents, no sidecars, no config to maintain. ${INTEGRATION_NAMES.length} integrations spanning cloud, identity, source code, payment, email, HR, observability, security, CRM, and docs.`,
    items: [
      "Cloud & infra - Vercel, Cloudflare, DigitalOcean, Neon",
      "Source code - GitHub, GitLab",
      "Identity - Okta, Clerk, 1Password",
      "HR / HCM - BambooHR, Workday, Gusto, Rippling, Personio",
      "Observability - Datadog, Sentry, PagerDuty",
      "Security & tickets - Snyk, Jira, Linear, Slack",
      "Payment & CRM - Stripe, Salesforce, HubSpot",
      "Docs & wiki - Notion, Confluence",
      "Browse the full grid and each integration's evidence map at /integrations",
    ],
  },
  {
    title: "AI compliance agent with on-demand audits",
    desc: "Spire's audit agent probes your connected APIs, evaluates each control against the evidence those APIs return, and produces a structured pass/fail/warning report. The audit streams live as NDJSON so you can watch every verdict land.",
    items: [
      "Runs against all 56 SOC 2 common criteria and 10 EU AI Act articles - 66 controls total",
      "Each verdict is streamed live so you can watch evidence being collected in real time",
      "Each verdict cites the specific evidence that backs it, with the source API call recorded",
      "Controls it can't verify automatically are flagged with a recommended next step for your team",
      "Re-run anytime - new evidence and new integrations are picked up on the next pass",
    ],
  },
  {
    title: "Auto-fills security questionnaires from live evidence",
    desc: "Upload any vendor questionnaire - PDF, TXT, CSV, HTML, Markdown. The agent investigates your connected integrations for evidence, maps each question to what it finds, and writes a confidence-scored answer grounded in your real data, not generic SOC 2 knowledge.",
    items: [
      "Confidence score per question - 0 to 100%",
      "Every answer references the actual evidence backing it (or is flagged when evidence is absent)",
      "Low-confidence answers route to your review queue separately so you only spend time on the ones that need you",
      "A 200-question enterprise review drops from ~40 engineering hours of draft-and-check to a handful of review-confirms",
    ],
  },
  {
    title: "Audit-ready evidence exports",
    desc: "Generate a timestamped evidence bundle for your auditor or enterprise prospect. JSON export with structured verdicts, control-by-control detail, and full provenance - auditor opens one file, sees everything.",
    items: [
      "JSON export grouped by framework - SOC 2 and EU AI Act sections, side by side",
      "Each verdict includes the specific evidence, its last-checked timestamp, and the source API",
      "No scraping, no manual screenshotting - every line was collected live during the period",
      "Auditor-facing packs and prospect-facing packs share the same underlying evidence store",
    ],
  },
];

// Honest non-claims - what Spire does not (yet) do, and what it does not
// intend to do. Surfacing this upfront is itself part of the marketing
// strategy: buyers who read it come in with calibrated expectations and
// leave less likely to churn or leave a negative review.
const honestNonClaims = [
  "We don't replace your auditor - we make their job faster by handing them provable, source-backed evidence and a structured export.",
  "We're not SOC 2 certified yet. Our own posture snapshot lives at /trust-center and we're working toward formal certification - no false claims, no borrowed logos.",
  "We don't lock you in. Every evidence item is permanently exportable as JSON. If you cancel, your data is yours to take with you.",
];

export default function FeaturesPage() {
  const [primaryFeature, secondaryFeature, ...restFeatures] = features;

  return (
    <PublicLayout>
      <StructuredData
        schemas={breadcrumbListSchema([
          { name: "Home", url: "/" },
          { name: "Features", url: "/features" },
        ])}
      />

      {/* Hero section - centered, no eyebrow */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
            What Spire actually does
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            {INTEGRATION_NAMES.length} integrations. 66 mapped controls. One
            platform.{" "}
            <span className="text-text-tertiary">
              No marketing modules. No AI agents that don't ship.
            </span>
          </p>
        </div>
      </section>

      {/* Primary feature - split layout, text left, visual right */}
      <section className="border-t border-border-primary">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                {primaryFeature.title}
              </h2>
              <p className="mt-3 text-text-secondary">{primaryFeature.desc}</p>
              <ul className="mt-6 space-y-3">
                {primaryFeature.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-text-tertiary"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border-primary bg-surface-secondary p-8">
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Cloud & Infra",
                  "Source Code",
                  "Identity",
                  "HR / HCM",
                  "Observability",
                  "Security",
                  "Payment & CRM",
                  "Docs & Wiki",
                ].map((cat) => (
                  <div
                    key={cat}
                    className="rounded-lg border border-border-primary bg-surface-primary px-4 py-3 text-xs font-medium text-text-secondary"
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary feature - split layout, visual left, text right */}
      <section className="border-t border-border-primary">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-first lg:order-first">
              <div className="rounded-xl border border-border-primary bg-surface-secondary p-8">
                <div className="space-y-3">
                  {[
                    { label: "SOC 2 Access Control", pass: true },
                    { label: "SOC 2 Encryption", pass: true },
                    { label: "EU AI Act Transparency", pass: false },
                    { label: "SOC 2 Incident Response", pass: true },
                    { label: "SOC 2 Change Management", pass: true },
                    { label: "EU AI Act Risk Management", pass: false },
                  ].map((verdict) => (
                    <div
                      key={verdict.label}
                      className="flex items-center gap-3 rounded-lg border border-border-primary bg-surface-primary px-4 py-3"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          verdict.pass
                            ? "bg-brand/10 text-brand"
                            : "bg-amber-900/20 text-amber-400"
                        }`}
                      >
                        {verdict.pass ? "P" : "W"}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {verdict.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                {secondaryFeature.title}
              </h2>
              <p className="mt-3 text-text-secondary">
                {secondaryFeature.desc}
              </p>
              <ul className="mt-6 space-y-3">
                {secondaryFeature.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-text-tertiary"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Remaining features - two column card grid */}
      <section className="border-t border-border-primary">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-6 md:grid-cols-2">
            {restFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border-primary bg-surface-secondary p-8"
              >
                <h3 className="text-xl font-bold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {feature.desc}
                </p>
                <ul className="mt-5 space-y-2">
                  {feature.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-text-tertiary"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honest non-claims - left-accent callout style */}
      <section className="border-t border-border-primary">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <div className="border-l-2 border-brand pl-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary">
                Honest non-claims
              </p>
              <h2 className="mt-3 text-xl font-bold text-text-primary">
                What we don't do (yet) and what we don't intend to do
              </h2>
              <ul className="mt-5 space-y-4">
                {honestNonClaims.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 text-sm leading-relaxed text-text-secondary"
                  >
                    <span className="mt-0.5 shrink-0 text-brand">*</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-text-tertiary">
                We update this section as features ship. The current snapshot of
                Spire's own compliance posture (the same engine, applied to
                ourselves) lives at{" "}
                <Link
                  to="/trust-center"
                  className="text-brand hover:text-brand-dark"
                >
                  /trust-center
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section - centered card */}
      <section className="border-t border-border-primary">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="rounded-xl border border-border-primary bg-surface-secondary p-12 text-center">
            <h2 className="text-2xl font-bold text-text-primary">
              {INTEGRATION_NAMES.length} integrations. 66 mapped controls. One
              platform.
            </h2>
            <p className="mt-2 text-sm text-text-tertiary">
              Connect your first system in under 5 minutes. No credit card
              required.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/login"
                className="inline-flex h-11 items-center rounded-[20px] bg-brand px-6 text-sm font-semibold text-black transition-all hover:bg-brand-dark hover:scale-[0.97] active:scale-[0.95]"
              >
                Connect your first integration
              </Link>
              <Link
                to="/pricing"
                className="inline-flex h-11 items-center rounded-[20px] border border-border-primary px-6 text-sm font-medium text-text-secondary transition-all hover:border-brand/40 hover:text-text-primary hover:scale-[0.97] active:scale-[0.95]"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
