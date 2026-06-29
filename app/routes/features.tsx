import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";

export function meta() {
  return [
    { title: "Features | Spire — SOC 2 & EU AI Act Compliance Automation" },
    { name: "description", content: "Spire connects to AWS, GitHub, Google Cloud, and 6 more services. Collects SOC 2 and EU AI Act evidence continuously. Auto-fills security questionnaires. One-click evidence export." },
    { property: "og:title", content: "Features | Spire" },
    { property: "og:type", content: "website" },
  ];
}

const features = [
  {
    title: "Connects to your existing stack",
    desc: "Read-only integrations with the infrastructure you already run. No agents, no sidecars, no configuration changes.",
    items: [
      "AWS — CloudTrail, IAM, S3 bucket policies, EC2 security groups, KMS key rotation",
      "GitHub — branch protection rules, required PR reviews, secret scanning alerts",
      "Google Workspace — admin audit log, directory, MFA enforcement",
      "Vercel — deployment logs, environment variable configuration",
      "Cloudflare — WAF rules, SSL/TLS settings, DDoS protection",
      "Clerk — MFA configuration, session management, user directory",
      "Supabase — Row Level Security, encryption at rest, auth providers",
      "Stripe — PCI compliance scope, webhook signing, data retention",
      "Resend — DKIM/SPF configuration, email encryption",
    ],
  },
  {
    title: "Evaluates evidence against controls",
    desc: "Each integration feeds into a structured evidence library. The AI agent checks every control and produces pass/fail verdicts with supporting evidence.",
    items: [
      "66 controls across SOC 2 (56) and EU AI Act (10)",
      "AI agent evaluates all collected evidence on demand",
      "Each verdict includes the specific evidence that backs it",
      "Controls needing human review are flagged separately",
      "Re-run the audit anytime — new evidence is picked up automatically",
    ],
  },
  {
    title: "Fills security questionnaires from live evidence",
    desc: "Upload any vendor questionnaire. The AI matches each question to your evidence library and generates a response. Only uncertain answers need your review.",
    items: [
      "Accepts PDF, DOCX, CSV, markdown, HTML, and plain text",
      "Answers are grounded in your actual collected evidence",
      "Confidence score per question — 0 to 100%",
      "Low-confidence answers routed to you for review",
      "Supporting evidence attached to every response automatically",
    ],
  },
  {
    title: "Exports evidence packs for auditors",
    desc: "Generate a structured evidence bundle organized by control. Ready to share with your SOC 2 auditor or enterprise prospect.",
    items: [
      "Separate packs for SOC 2 and EU AI Act frameworks",
      "Every piece of evidence has a timestamp and source attribution",
      "Control-by-control traceability — no digging through spreadsheets",
      "Export as structured JSON for audit tool import",
    ],
  },
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
            Nine integrations, 66 controls, one compliance platform. No marketing modules, no AI agents that don't ship.
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

        <div className="mt-16 rounded-xl border border-[#1A1D1E] bg-[#0B0D0E] p-8 text-center">
          <h2 className="text-xl font-bold text-[#E8E8E8]">9 integrations. 66 controls. No fluff.</h2>
          <p className="mt-2 text-sm text-[#6A6D6E]">Connect your stack and see what's covered in under 10 minutes.</p>
          <Link to="/login" className="mt-6 inline-block rounded-lg bg-[#00D4AA] px-8 py-3 font-semibold text-black hover:bg-[#00B894] transition-colors">
            Start now — integrations are free
          </Link>
        </div>
      </section>

    </PublicLayout>
  );
}
