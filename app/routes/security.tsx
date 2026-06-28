import { Link } from "react-router";

const sections = [
  { title: "Read-only architecture", desc: "We connect to your infrastructure with read-only API access. We never write, modify, or delete anything in your systems. Every integration uses scoped, minimal-privilege credentials that can be revoked at any time." },
  { title: "Encryption at rest and in transit", desc: "All evidence data is encrypted at rest using AES-256 and in transit using TLS 1.3. We never store raw credentials — access tokens are encrypted before storage and only decrypted at collection time." },
  { title: "SOC 2-aligned operations", desc: "We follow the same SOC 2 standards we help you meet. Our own security practices are mapped to the trust services criteria, and we maintain internal access controls, monitoring, and incident response procedures." },
  { title: "Data sovereignty", desc: "Evidence data is stored in your choice of region (US, EU, or UK). We maintain separate data stores per customer. You can request data export or deletion at any time." },
  { title: "Access control", desc: "Team members are scoped to their organization. Role-based access controls limit who can view evidence, manage integrations, or export audit packs. All access is logged and auditable." },
  { title: "Vulnerability management", desc: "We run continuous dependency scanning, static analysis on every deployment, and annual penetration tests. Critical vulnerabilities are patched within 24 hours." },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-lg font-bold tracking-tight text-[#F1F1F3]">Spire</Link>
        <div className="flex items-center gap-8">
          <Link to="/features" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Features</Link>
          <Link to="/integrations" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Integrations</Link>
          <Link to="/pricing" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Pricing</Link>
          <Link to="/security" className="text-sm text-[#00D4AA] transition-colors">Security</Link>
          <Link to="/login" className="rounded-lg border border-[#1C1C24] px-4 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors">Sign in</Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-20 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Security</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">
            Trust is our product<br />
            <span className="text-[#00D4AA]">security is our foundation</span>
          </h1>
          <p className="mt-4 text-lg text-[#8B8B93]">
            We handle your compliance evidence the same way we help you handle your customers' data — with care, transparency, and industry-standard safeguards.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {sections.map((s) => (
            <div key={s.title} className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
              <h2 className="text-lg font-bold text-[#F1F1F3]">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#8B8B93]">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-xl border border-[#1C1C24] bg-[#111116] p-8 text-center">
          <h2 className="text-xl font-bold text-[#F1F1F3]">Need more details?</h2>
          <p className="mt-2 text-sm text-[#8B8B93]">We're happy to share our security documentation, penetration test results, or complete a vendor security assessment.</p>
          <Link to="/contact" className="mt-5 inline-block rounded-lg bg-[#00D4AA] px-6 py-2.5 text-sm font-medium text-black hover:bg-[#00B894] transition-colors">
            Contact our security team
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
