import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { INTEGRATION_NAMES } from "~/lib/integration-data";

export function meta() {
  return [
    { title: `Features | Spire — ${INTEGRATION_NAMES.length} integrations, 66 mapped controls` },
    {
      name: "description",
      content: `Spire connects to ${INTEGRATION_NAMES.length} production systems via read-only Composio OAuth. Collects SOC 2 and EU AI Act evidence continuously. AI compliance agent runs on-demand audits. Auto-fills security questionnaires. One-click evidence export.`,
    },
    { property: "og:title", content: "Features | Spire" },
    { property: "og:type", content: "website" },
  ];
}

const features = [
  {
    title: "Continuous evidence from your stack",
    desc: `Read-only OAuth via Composio — no agents, no sidecars, no config to maintain. ${INTEGRATION_NAMES.length} integrations spanning cloud, identity, source code, payment, email, HR, observability, security, CRM, and docs.`,
    items: [
      "Cloud & infra — AWS, Microsoft Azure, Vercel, Cloudflare, DigitalOcean",
      "Source code — GitHub, GitLab",
      "Identity — Google Workspace, Microsoft 365, Okta, Clerk",
      "HR / HCM — BambooHR, Workday, Gusto, Rippling, Personio",
      "Observability — Datadog, Sentry, PagerDuty",
      "Security & tickets — Snyk, Jira, Linear, Slack",
      "Payment & CRM — Stripe, Salesforce, HubSpot",
      "Docs & wiki — Notion, Confluence",
      "Browse the full grid and each integration's evidence map at /integrations",
    ],
  },
  {
    title: "AI compliance agent with on-demand audits",
    desc: "Spire's audit agent probes your connected APIs, evaluates each control against the evidence those APIs return, and produces a structured pass/fail/warning report. The audit streams live as NDJSON so you can watch every verdict land.",
    items: [
      "Runs against all 56 SOC 2 common criteria — not just the subset you have integrations for",
      "Plus 10 EU AI Act articles (transparency, logging, human oversight, risk management, accuracy, governance)",
      "Each verdict cites the specific evidence that backs it, with the Composio source API call recorded",
      "Controls it can't verify automatically are flagged with a recommended next step for your team",
      "Re-run anytime — new evidence and new integrations are picked up on the next pass",
    ],
  },
  {
    title: "Auto-fills security questionnaires from live evidence",
    desc: "Upload any vendor questionnaire — PDF, DOCX, CSV, HTML, Markdown, plain text. The agent maps each question to your evidence and writes a confidence-scored answer grounded in your real data, not generic SOC 2 knowledge.",
    items: [
      "Confidence score per question — 0 to 100%",
      "Every answer references the actual evidence backing it (or is flagged when evidence is absent)",
      "Low-confidence answers route to your review queue separately so you only spend time on the ones that need you",
      "A 200-question enterprise review drops from ~40 engineering hours of draft-and-check to a handful of review-confirms",
    ],
  },
  {
    title: "Audit-ready evidence exports",
    desc: "Generate a timestamped evidence bundle for your auditor or enterprise prospect. JSON export with structured verdicts, control-by-control detail, and full provenance — auditor opens one file, sees everything.",
    items: [
      "JSON export grouped by framework — SOC 2 and EU AI Act sections, side by side",
      "Each verdict includes the specific evidence, its last-checked timestamp, and the source API",
      "No scraping, no manual screenshotting — every line was collected via Composio during the period",
      "Auditor-facing packs and prospect-facing packs share the same underlying evidence store",
    ],
  },
];

// Honest non-claims — what Spire does not (yet) do, and what it does not
// intend to do. Surfacing this upfront is itself part of the marketing
// strategy: buyers who read it come in with calibrated expectations and
// leave less likely to churn or leave a negative review.
const honestNonClaims = [
  "We don't replace your auditor — we make their job faster by handing them provable, source-backed evidence and a structured export.",
  "EU AI Act mapping is partial today. Controls Spire can't yet verify are honestly tagged 'Mapping emerging' or 'Pending mapping' in the control explorer — we don't dress up incomplete coverage as complete.",
  "We're not SOC 2 certified yet. Our own posture snapshot lives at /trust-center and we're working toward formal certification — no false claims, no borrowed logos.",
  "Penetration testing is planned for H2 2026. We're collecting evidence toward that engagement — not claiming a pre-existing report that doesn't exist.",
  "We don't lock you in. Every evidence item is permanently exportable as JSON. If you cancel, your data is yours to take with you.",
];

export default function FeaturesPage() {
  return (
    <PublicLayout>

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Features</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">
            What Spire actually does
          </h1>
          <p className="mt-4 text-lg text-[#8B8B93]">
            {INTEGRATION_NAMES.length} integrations. 66 mapped controls. One platform.{" "}
            <span className="text-[#6A6D6E]">
              No marketing modules. No AI agents that don't ship.
            </span>
          </p>
        </div>

        <div className="mt-16 space-y-6">
          {features.map((section) => (
            <div key={section.title} className="rounded-xl border border-[#1C1C24] bg-[#111116] p-8">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D4AA]/10 text-sm font-bold text-[#00D4AA]">✓</span>
                <div>
                  <h2 className="text-xl font-bold text-[#F1F1F3]">{section.title}</h2>
                  <p className="mt-0.5 text-sm text-[#8B8B93]">{section.desc}</p>
                </div>
              </div>
              <ul className="mt-6 space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#6A6D6E]">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#4A4D4E]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Honest non-claims — what Spire does not do today. Surfacing this
            here converts more qualified buyers than hiding it does. The list
            above is finite and non-aspirational — when an item graduates
            ("EU AI Act mapping is complete"), it moves out of this band and
            into the main feature list above. */}
        <div className="mt-12 rounded-xl border border-[#1A1D1E] bg-[#0B0D0E]/50 p-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5C5C66]">
            Honest non-claims
          </span>
          <h2 className="mt-3 text-xl font-bold text-[#E8E8E8]">
            What we don't do (yet) — and what we don't intend to do
          </h2>
          <ul className="mt-5 space-y-3">
            {honestNonClaims.map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm leading-relaxed text-[#8B8B93]">
                <span className="mt-0.5 shrink-0 text-[#5C5C66]">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-[#5C5C66]">
            We update this section as features ship. The current snapshot of
            Spire's own compliance posture (the same engine, applied to
            ourselves) lives at{" "}
            <Link to="/trust-center" className="text-[#00D4AA] hover:text-[#00B894]">
              /trust-center
            </Link>
            .
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-[#1A1D1E] bg-[#0B0D0E] p-8 text-center">
          <h2 className="text-xl font-bold text-[#E8E8E8]">
            {INTEGRATION_NAMES.length} integrations. 66 mapped controls. One platform.
          </h2>
          <p className="mt-2 text-sm text-[#6A6D6E]">
            Connect your first system in under 5 minutes. No credit card required.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="inline-block rounded-lg bg-[#00D4AA] px-8 py-3 font-semibold text-black hover:bg-[#00B894] transition-colors"
            >
              Connect your first integration
              <svg className="ml-1 inline-block h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10m-3-4 4 4-4 4" />
              </svg>
            </Link>
            <Link
              to="/pricing"
              className="inline-block rounded-lg border border-[#1A1D1E] bg-transparent px-6 py-3 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA]/40 hover:text-[#00D4AA] transition-colors"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
