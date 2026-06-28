import { Link } from "react-router";

const integrations = [
  { name: "GitHub", icon: "G", desc: "Source code, PRs, deployments, access control.",
    evidence: ["Commit history (CC8)", "Branch protection (CC6)", "Collaborator access (CC6)", "Pull request audit trails (CC8)", "Secret scanning"] },
  { name: "AWS", icon: "A", desc: "Cloud infrastructure, IAM, monitoring, storage.",
    evidence: ["CloudTrail event history (CC7)", "IAM user permissions (CC6)", "S3 encryption status (C1)", "EC2 instance inventory (A1)", "Security group review"] },
  { name: "Google Workspace", icon: "G", desc: "Admin audit logs, directory, OAuth.",
    evidence: ["Admin activity reports (CC7)", "User directory with admin status (CC6)", "Login audit events", "OAuth token scope review"] },
  { name: "Vercel", icon: "V", desc: "Deployments, environment variables, team access.",
    evidence: ["Deployment protection (CC8)", "Environment variable scoping (C1)", "Team member access (CC6)"] },
  { name: "Cloudflare", icon: "C", desc: "DNS, CDN, WAF, DDoS protection.",
    evidence: ["WAF rule configuration (CC7)", "SSL/TLS settings (C1)", "DDoS protection (A1)"] },
  { name: "Clerk", icon: "C", desc: "Authentication, user management, MFA.",
    evidence: ["MFA enforcement (CC6)", "SSO configuration (CC6)", "Session management (CC6)"] },
  { name: "Supabase", icon: "S", desc: "Database, auth, storage, realtime.",
    evidence: ["Encryption at rest (C1)", "Row-level security (CC6)", "Auth settings (CC6)"] },
  { name: "Stripe", icon: "S", desc: "Payments, billing, subscriptions.",
    evidence: ["PCI compliance posture (C1)", "Webhook signing (PI1)", "API key rotation (CC6)"] },
  { name: "Resend", icon: "R", desc: "Transactional email, deliverability.",
    evidence: ["DKIM/SPF configuration (C1)", "Email encryption (C1)", "API key scoping (CC6)"] },
];

const comingSoon = [
  "GitLab", "Azure DevOps", "Slack", "Jira", "Linear",
  "Microsoft 365", "Okta", "Datadog", "Neon", "Sentry",
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-lg font-bold tracking-tight text-[#F1F1F3]">Spire</Link>
        <div className="flex items-center gap-8">
          <Link to="/features" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Features</Link>
          <Link to="/integrations" className="text-sm text-[#00D4AA] transition-colors">Integrations</Link>
          <Link to="/pricing" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Pricing</Link>
          <Link to="/login" className="rounded-lg border border-[#1C1C24] px-4 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors">Sign in</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Integrations</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">
            Connect your stack in minutes<br />
            <span className="text-[#00D4AA]">read-only and risk-free</span>
          </h1>
          <p className="mt-4 text-lg text-[#8B8B93]">
            We connect to your existing tools via read-only APIs via Composio. 9 integrations and growing.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {integrations.map((int) => (
            <div key={int.name} className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00D4AA]/10 text-lg font-bold text-[#00D4AA]">{int.icon}</div>
              <h2 className="mt-5 text-xl font-bold text-[#F1F1F3]">{int.name}</h2>
              <p className="mt-1 text-sm text-[#8B8B93]">{int.desc}</p>
              <div className="mt-5 rounded-lg border border-[#1C1C24] bg-[#0A0A0C] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5C5C66]">Evidence collected</p>
                <ul className="mt-2 space-y-1.5">
                  {int.evidence.map((e) => (
                    <li key={e} className="flex items-start gap-2 text-xs text-[#8B8B93]">
                      <svg className="mt-0.5 h-3 w-3 shrink-0 text-[#00D4AA]" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
