import { Link } from "react-router";

const sections = [
  { title: "Acceptance of terms", content: "By accessing or using Spire, you agree to be bound by these terms. If you are using the service on behalf of an organisation, you represent that you have authority to bind that organisation." },
  { title: "Service description", content: "Spire provides compliance automation software that connects to your infrastructure via read-only APIs, collects evidence data, maps it to compliance controls, and auto-fills security questionnaires. We may update the service from time to time." },
  { title: "User obligations", content: "You are responsible for maintaining the confidentiality of your account credentials. You agree not to use the service for any unlawful purpose or in violation of any applicable laws or regulations. You must ensure that your use of the service complies with your agreements with third-party platforms." },
  { title: "Data handling", content: "We process data you authorise us to access through integrations. We do not modify your infrastructure or data. You retain all ownership and control over your data. Our data handling practices are detailed in our Privacy Policy." },
  { title: "Fees and payment", content: "Fees are billed in advance on a monthly or annual basis as selected during sign-up. All fees are non-refundable except as expressly stated in these terms. We may change fees with 30 days notice. Late payments may result in service suspension." },
  { title: "Cancellation", content: "You may cancel your account at any time from your settings page. Upon cancellation, access to the service continues until the end of your billing period. Evidence data is retained for 30 days after cancellation before deletion." },
  { title: "Limitation of liability", content: "Spire is provided 'as is' without warranty of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability is limited to the fees paid in the 12 months preceding the claim." },
  { title: "Intellectual property", content: "The Spire service, including its software, design, and branding, is owned by Spire Ltd. You may not copy, modify, distribute, or reverse engineer the service without our written consent." },
  { title: "Governing law", content: "These terms are governed by the laws of England and Wales. Any disputes shall be resolved in the courts of London, UK." },
];

export default function TermsPage() {
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
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">Terms of service</h1>
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
            Questions about these terms? Contact <span className="text-[#00D4AA]">legal@synov8studio.com</span>
          </p>
        </div>
      </section>

      <footer className="border-t border-[#1C1C24] py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-bold tracking-tight text-[#F1F1F3]">Spire</span>
          <div className="flex items-center gap-6 text-sm text-[#5C5C66]">
            <Link to="/privacy" className="hover:text-[#8B8B93] transition-colors">Privacy</Link>
            <Link to="/terms" className="text-[#8B8B93] transition-colors">Terms</Link>
            <span>© {new Date().getFullYear()} Synov8 Ltd.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
