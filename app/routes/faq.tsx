import { useState } from "react";
import { Link } from "react-router";

const faqs = [
  { q: "What is Spire?", a: "Spire is a compliance automation platform that continuously collects evidence from your infrastructure across 9 integrations (AWS, GitHub, Google Workspace, Vercel, Cloudflare, Clerk, Supabase, Stripe, Resend), maps it to SOC 2 and EU AI Act controls via an AI agent, and auto-fills security questionnaires — so you're always audit-ready." },
  { q: "How is this different from a compliance checklist or spreadsheet?", a: "Instead of manually tracking evidence in spreadsheets, Spire connects directly to your systems and collects evidence automatically. Your compliance state updates in real time, not quarterly. Questionnaires get filled from live data, not from someone's memory." },
  { q: "Do I still need a compliance consultant?", a: "Spire handles evidence collection, control mapping, and questionnaire autofill. For initial gap analysis, control design, and audit walkthroughs a consultant can still add value — but you'll need them for far fewer hours." },
  { q: "Which frameworks do you support?", a: "SOC 2 (all five trust service criteria) and the EU AI Act (10 controls covering transparency, logging, human oversight, risk management, and more). ISO 27001 and GDPR evidence mapping are on the roadmap." },
  { q: "How long does setup take?", a: "Connect your first integration in under 5 minutes. Within an hour you'll see your compliance state mapped to controls. Full setup with all integrations typically takes half a day." },
  { q: "Can I try it before committing?", a: "Yes. Connect your GitHub repo and see your compliance state mapped in minutes — no credit card required." },
  { q: "What access do you need to my systems?", a: "Read-only API access. We never modify your infrastructure, code, or configurations. Credentials are encrypted and can be revoked at any time." },
  { q: "How accurate is the questionnaire autofill?", a: "Our AI auto-fills the majority of questions on first pass, depending on the complexity of the questionnaire and the evidence available. Every answer includes a confidence score, and uncertain answers are flagged for human review." },
  { q: "What happens to my evidence data?", a: "Evidence is encrypted at rest (AES-256) and in transit (TLS 1.3). You control data retention and can export or delete everything at any time. We maintain separate data stores per customer." },
  { q: "How does pricing work?", a: "We offer three plans: Starter (£200/mo), Growth (£1,200/mo), and Enterprise (from £3,000/mo). Annual billing saves 20%. You can start using Spire for free — no credit card required." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-lg font-bold tracking-tight text-[#F1F1F3]">Spire</Link>
        <div className="flex items-center gap-8">
          <Link to="/features" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Features</Link>
          <Link to="/pricing" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Pricing</Link>
          <Link to="/faq" className="text-sm text-[#00D4AA] transition-colors">FAQ</Link>
          <Link to="/login" className="rounded-lg border border-[#1C1C24] px-4 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors">Sign in</Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-24">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">FAQ</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">Frequently asked questions</h1>
        </div>

        <div className="mt-14 space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-[#1C1C24] bg-[#111116]">
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[#0A0A0C]/50 rounded-xl">
                <span className="text-sm font-medium text-[#F1F1F3] pr-4">{faq.q}</span>
                <svg className={`h-4 w-4 shrink-0 text-[#5C5C66] transition-transform ${open === i ? "rotate-180" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              {open === i && (
                <div className="border-t border-[#1C1C24] px-6 py-4">
                  <p className="text-sm leading-relaxed text-[#8B8B93]">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-[#1C1C24] bg-[#111116] p-8 text-center">
          <h2 className="text-lg font-bold text-[#F1F1F3]">Still have questions?</h2>
          <p className="mt-2 text-sm text-[#8B8B93]">We're here to help.</p>
          <Link to="/blog" className="hover:text-[#8B8B93] transition-colors">Blog</Link>
            <Link to="/contact" className="mt-4 inline-block rounded-lg bg-[#00D4AA] px-6 py-2.5 text-sm font-medium text-black hover:bg-[#00B894] transition-colors">
            Contact us
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#1C1C24] py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-bold tracking-tight text-[#F1F1F3]">Spire</span>
          <div className="flex items-center gap-6 text-sm text-[#5C5C66]">
            <Link to="/privacy" className="hover:text-[#8B8B93] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#8B8B93] transition-colors">Terms</Link>
            <span>© {new Date().getFullYear()} Synov8 Ltd.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
