import { Link } from "react-router";

const features = [
  { title: "Continuous evidence collection", desc: "Your infrastructure feeds the compliance graph automatically.",
    items: [
      "AWS (CloudTrail, IAM, S3, EC2) + GitHub (commits, PRs, access)",
      "Google Workspace (audit, directory) + Vercel (deployments, env)",
      "Cloudflare (WAF, SSL) + Clerk (MFA, SSO) + Supabase (encryption, RLS)",
      "Stripe (PCI, webhooks) + Resend (DKIM, SPF) — 9 total integrations",
      "Real-time change tracking across all connected systems",
    ] },
  { title: "Multi-framework compliance engine", desc: "Every piece of evidence is mapped to the right control across frameworks automatically.",
    items: [
      "56 SOC 2 controls across all five trust service criteria",
      "10 EU AI Act controls covering transparency, logging, literacy, and risk",
      "AI-powered evidence-to-control matching via Composio agent",
      "Automatic gap analysis — know what's missing instantly",
    ] },
  { title: "Security questionnaire autopilot", desc: "Upload a vendor questionnaire and get it filled in minutes.",
    items: [
      "Parses PDF, DOC, text, HTML, and CSV formats",
      "AI generates answers using your live evidence",
      "Majority auto-filled on first pass with confidence scoring",
      "Confidence scoring per question — only tricky ones need you",
      "Evidence links attached to every answer automatically",
    ] },
  { title: "Audit-ready evidence packs", desc: "Generate complete SOC 2 evidence bundles in one click.",
    items: [
      "Timestamped, structured evidence export",
      "Control-by-control evidence traceability",
      "Share with auditors, prospects, or procurement",
      "Full audit trail of all collected data",
    ] },
  { title: "AI compliance advisor", desc: "Understand your compliance posture instantly.",
    items: [
      "Executive summary generation for board and investor updates",
      "Gap analysis with prioritised remediation steps",
      "Trend insights — are you getting more or less compliant?",
      "Natural-language querying of your compliance state",
    ] },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-lg font-bold tracking-tight text-[#F1F1F3]">Spire</Link>
        <div className="flex items-center gap-8">
          <Link to="/features" className="text-sm text-[#00D4AA] transition-colors">Features</Link>
          <Link to="/integrations" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Integrations</Link>
          <Link to="/pricing" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Pricing</Link>
          <Link to="/login" className="rounded-lg border border-[#1C1C24] px-4 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors">Sign in</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Features</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">
            Everything you need to be<br />
            <span className="text-[#00D4AA]">continuously audit-ready</span>
          </h1>
          <p className="mt-4 text-lg text-[#8B8B93]">
            From evidence collection to questionnaire autofill — Spire automates the entire compliance workflow.
          </p>
        </div>

        <div className="mt-20 space-y-24">
          {features.map((section, i) => (
            <div key={section.title} className={`grid items-center gap-12 md:grid-cols-2 ${i % 2 === 1 ? "md:grid-flow-dense" : ""}`}>
              <div className={i % 2 === 1 ? "md:col-start-2" : ""}>
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">0{i + 1}</span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#F1F1F3] md:text-3xl">{section.title}</h2>
                <p className="mt-2 text-[#8B8B93]">{section.desc}</p>
                <ul className="mt-6 space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-[#8B8B93]">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4AA]" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`rounded-xl border border-[#1C1C24] bg-[#111116] p-8 ${i % 2 === 1 ? "md:col-start-1 md:row-start-1" : ""}`}>
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#00D4AA]/10">
                  <span className="text-2xl font-bold text-[#00D4AA]">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                  ["AWS / GitHub", "CloudTrail, IAM, S3, EC2, commits, PRs"],
                  ["Google / Vercel", "Admin audit, directory, deployments, env"],
                  ["Cloudflare / Clerk", "WAF, SSL, MFA, SSO, sessions"],
                  ["Supabase / Stripe / Resend", "Encryption, RLS, PCI, DKIM, SPF"],
                  ].slice(0, section.items.length).map(([label, detail]) => (
                    <div key={label} className="flex items-center gap-3 rounded-lg border border-[#1C1C24] bg-[#0A0A0C] px-3 py-2.5">
                      <span className="h-2 w-2 rounded-full bg-[#00D4AA]" />
                      <span className="text-sm font-medium text-[#F1F1F3]">{label}</span>
                      <span className="ml-auto text-xs text-[#5C5C66]">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#F1F1F3]">Ready to get started?</h2>
          <p className="mt-3 text-[#8B8B93]">Connect your first integration and see your compliance state in minutes.</p>
          <Link to="/login" className="mt-6 inline-block rounded-lg bg-[#00D4AA] px-8 py-3 font-semibold text-black hover:bg-[#00B894] transition-colors">
            Start now — it's free
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#1C1C24] py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-bold tracking-tight text-[#F1F1F3]">Spire</span>
          <div className="flex items-center gap-6 text-sm text-[#5C5C66]">
            <Link to="/privacy" className="hover:text-[#8B8B93] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#8B8B93] transition-colors">Terms</Link>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
