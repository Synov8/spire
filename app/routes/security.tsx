import { Link } from "react-router";
import { OrganizationSchema } from "~/components/geo-schema";

export function meta() {
  return [
    { title: "Security & Compliance | Spire" },
    { name: "description", content: "Spire's SOC 2 Type II certification, EU AI Act compliance framework, data encryption standards, penetration testing cadence, and infrastructure security architecture for B2B SaaS." },
    { property: "og:title", content: "Security & Compliance | Spire" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export default function Security() {
  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <OrganizationSchema />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-lg font-bold tracking-tight text-[#F1F1F3]">Spire</Link>
        <div className="flex items-center gap-8">
          <Link to="/features" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Features</Link>
          <Link to="/pricing" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Pricing</Link>
          <Link to="/blog" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Blog</Link>
          <Link to="/login" className="rounded-lg border border-[#1C1C24] px-4 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors">Sign in</Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pt-16 pb-24">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Security & Compliance</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">Enterprise-grade security for your compliance data</h1>
        <p className="mt-4 text-lg text-[#8B8B93]">Spire is built to meet the same security standards we help our customers achieve. Our platform undergoes annual SOC 2 Type II audits, follows EU AI Act governance requirements, and encrypts all data in transit and at rest.</p>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
            <h2 className="text-lg font-bold text-[#F1F1F3]">SOC 2 Type II Certified</h2>
            <p className="mt-2 text-sm text-[#8B8B93]">Annual SOC 2 Type II audit covering the Security trust service criterion. Our report is available to customers under NDA. Controls are continuously monitored via automated evidence collection across our entire infrastructure.</p>
            <ul className="mt-4 space-y-2 text-sm text-[#8B8B93]">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> Annual re-certification cycle</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> Continuous control monitoring</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> Auditor-ready evidence library</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> SOC 2 report available on request</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
            <h2 className="text-lg font-bold text-[#F1F1F3]">EU AI Act Aligned</h2>
            <p className="mt-2 text-sm text-[#8B8B93]">Our AI compliance agent and internal AI governance framework align with EU AI Act requirements including Article 4 AI literacy, Article 50 transparency, and GPAI Code of Practice documentation standards.</p>
            <ul className="mt-4 space-y-2 text-sm text-[#8B8B93]">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> Documented AI governance policies</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> Zero data retention on AI processing</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> AI transparency disclosures</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> ISO 42001-ready framework</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
            <h2 className="text-lg font-bold text-[#F1F1F3]">Data Encryption</h2>
            <p className="mt-2 text-sm text-[#8B8B93]">All customer data is encrypted at rest using AES-256 and in transit using TLS 1.3. API keys and secrets are stored using Cloudflare Workers Secrets with automatic rotation.</p>
            <ul className="mt-4 space-y-2 text-sm text-[#8B8B93]">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> AES-256 encryption at rest</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> TLS 1.3 in transit</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> Zero data retention with AI providers</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> Secrets encrypted at rest</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
            <h2 className="text-lg font-bold text-[#F1F1F3]">Infrastructure Security</h2>
            <p className="mt-2 text-sm text-[#8B8B93]">Spire runs on Cloudflare Workers with data stored in Neon PostgreSQL on AWS. All infrastructure is SOC 2 compliant. Annual penetration testing covers our full attack surface.</p>
            <ul className="mt-4 space-y-2 text-sm text-[#8B8B93]">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> Cloudflare Workers edge network</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> Neon PostgreSQL (AWS-hosted)</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> Annual penetration testing</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" /> Uptime monitoring and alerting</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
          <h2 className="text-lg font-bold text-[#F1F1F3]">Compliance certifications and reports</h2>
          <p className="mt-2 text-sm text-[#8B8B93]">We provide the following compliance documentation to customers under NDA during procurement. Contact us to request access.</p>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-lg bg-[#1C1C24] px-4 py-3"><span className="font-medium text-[#F1F1F3]">SOC 2 Type II Report</span><br /><span className="text-[#5C5C66]">Annual, Security TSC</span></div>
            <div className="rounded-lg bg-[#1C1C24] px-4 py-3"><span className="font-medium text-[#F1F1F3]">Penetration Test Report</span><br /><span className="text-[#5C5C66]">Annual, external + API scope</span></div>
            <div className="rounded-lg bg-[#1C1C24] px-4 py-3"><span className="font-medium text-[#F1F1F3]">Data Processing Agreement</span><br /><span className="text-[#5C5C66]">Standard DPA available on request</span></div>
            <div className="rounded-lg bg-[#1C1C24] px-4 py-3"><span className="font-medium text-[#F1F1F3]">Subprocessor List</span><br /><span className="text-[#5C5C66]">Current subprocessor inventory</span></div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-[#5C5C66]">Security questions? Contact us at <span className="text-[#00D4AA]">security@spire.synov8studio.com</span></p>
        </div>
      </section>

      <footer className="border-t border-[#1C1C24] py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-bold tracking-tight text-[#F1F1F3]">Spire</span>
          <div className="flex items-center gap-6 text-sm text-[#5C5C66]">
            <Link to="/blog" className="hover:text-[#8B8B93] transition-colors">Blog</Link>
            <Link to="/privacy" className="hover:text-[#8B8B93] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#8B8B93] transition-colors">Terms</Link>
            <span>&copy; {new Date().getFullYear()} Synov8 Ltd.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
