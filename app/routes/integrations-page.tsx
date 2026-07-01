import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { StructuredData } from "~/components/structured-data";
import { integrationsItemListSchema } from "~/lib/structured-data";
import { INTEGRATIONS } from "~/lib/integration-data";

export function meta() {
  return [
    { title: "Integrations | Spire — AWS, GitHub, GCP & More" },
    { name: "description", content: "Spire connects to AWS, GitHub, Google Cloud, Vercel, Cloudflare, Clerk, Supabase, Stripe, and Resend for automated SOC 2 and EU AI Act evidence collection." },
    { property: "og:title", content: "Integrations | Spire" },
    { property: "og:type", content: "website" },
  ];
}

// "Coming soon" — small honest subset. The previous list of 10 was mostly
// stale (we shipped GitLab, Slack, Jira, Linear, Microsoft 365, Okta, Datadog,
// and Sentry in this batch; Azure is shipped so Azure DevOps is folded in).
const comingSoon = [
  "Neon",
  "1Password",
  "OpenAI",
  "Anthropic",
];

// Render an evidence item as it was previously stored inline.
// Control IDs (e.g. "CC7", "CC6", "C1") are appended in parens when present
// so the rendered HTML matches the existing string format verbatim.
function formatEvidence(item: { control: string | null; text: string }) {
  return item.control ? `${item.text} (${item.control})` : item.text;
}

export default function IntegrationsPage() {
  return (
    <PublicLayout>

      {/* JSON-LD: ItemList of 9 integrations (each ListItem embeds nested Service) */}
      <StructuredData schemas={integrationsItemListSchema()} />

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Integrations</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">
            Connect your stack in minutes<br />
            <span className="text-[#00D4AA]">read-only and risk-free</span>
          </h1>
          <p className="mt-4 text-lg text-[#8B8B93]">
            We connect to your existing tools via read-only APIs via Composio. {INTEGRATIONS.length} integrations and growing.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {INTEGRATIONS.map((int) => (
            <Link
              key={int.slug}
              to={`/integrations/${int.slug}`}
              aria-label={`View ${int.name} integration details`}
              className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6 transition-colors hover:border-[#00D4AA]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00D4AA]/10 text-lg font-bold text-[#00D4AA]">{int.name[0]}</div>
              <h2 className="mt-5 text-xl font-bold text-[#F1F1F3]">{int.name}</h2>
              <p className="mt-1 text-sm text-[#8B8B93]">{int.description}</p>
              <div className="mt-5 rounded-lg border border-[#1C1C24] bg-[#0A0A0C] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5C5C66]">Evidence collected</p>
                <ul className="mt-2 space-y-1.5">
                  {int.evidence.map((e) => (
                    <li key={`${e.text}-${e.control ?? "x"}`} className="flex items-start gap-2 text-xs text-[#8B8B93]">
                      <svg className="mt-0.5 h-3 w-3 shrink-0 text-[#00D4AA]" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>
                      <span>{formatEvidence(e)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Coming soon</h2>
            <p className="mt-2 text-sm text-[#8B8B93]">We're adding new integrations every month.</p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {comingSoon.map((name) => (
              <span key={name} className="rounded-lg border border-[#1C1C24] bg-[#111116] px-4 py-2 text-sm text-[#5C5C66]">{name}</span>
            ))}
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
