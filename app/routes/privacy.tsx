import { Link } from "react-router";

const sections = [
  { title: "Information we collect", content: "When you sign up for Spire, we collect your name, email address, and company name. When you connect integrations, we collect read-only data from those systems including configuration metadata, access logs, and activity records. We do not collect sensitive personal data, passwords, or private keys." },
  { title: "How we use your information", content: "We use your information to operate the Spire service: collect and store compliance evidence, generate compliance mappings, auto-fill questionnaires, and provide you access to your compliance dashboard. We do not sell your data or use it for advertising." },
  { title: "Data storage and security", content: "Evidence data is encrypted at rest (AES-256) and in transit (TLS 1.3). We maintain separate data stores per customer. You can request data export or deletion at any time. Access tokens are encrypted before storage." },
  { title: "Data retention", content: "We retain your evidence data for as long as your account is active. Upon account cancellation, data is deleted within 30 days unless legal obligations require longer retention. You can request immediate deletion at any time." },
  { title: "Third-party subprocessors", content: "We use Neon (PostgreSQL database), Cloudflare (CDN and edge compute), and OpenAI (questionnaire processing) as subprocessors. All subprocessers are contractually bound to the same data protection standards." },
  { title: "Your rights", content: "You have the right to access, correct, export, and delete your data. You can manage integrations, revoke access tokens, and export evidence from your dashboard at any time. For any data request, contact privacy@synov8studio.com." },
  { title: "Changes to this policy", content: "We will notify you of material changes to this policy via email or in-app notification. Continued use of the service after changes constitutes acceptance of the updated policy." },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-lg font-bold tracking-tight text-[#F1F1F3]">Spire</Link>
        <div className="flex items-center gap-8">
          <Link to="/features" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Features</Link>
          <Link to="/pricing" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Pricing</Link>
          <Link to="/faq" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">FAQ</Link>
          <Link to="/login" className="rounded-lg border border-[#1C1C24] px-4 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors">Sign in</Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-24">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Legal</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">Privacy policy</h1>
          <p className="mt-3 text-sm text-[#5C5C66]">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>

        <div className="mt-14 space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-[#F1F1F3]">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#8B8B93]">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
          <p className="text-sm text-[#8B8B93]">
            Questions about this policy? Contact <span className="text-[#00D4AA]">privacy@synov8studio.com</span>
          </p>
        </div>
      </section>

      <footer className="border-t border-[#1C1C24] py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-bold tracking-tight text-[#F1F1F3]">Spire</span>
          <div className="flex items-center gap-6 text-sm text-[#5C5C66]">
            <Link to="/privacy" className="text-[#8B8B93] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#8B8B93] transition-colors">Terms</Link>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
