/**
 * FAQ data — single source of truth for FAQ copy.
 *
 * Imported by BOTH:
 *   • `app/routes/faq.tsx`        — renders all 10 entries on /faq.
 *   • `app/components/home-faq.tsx` — renders 5 selected entries inline on /.
 *
 * Acceptance criterion (home-overhaul-spec.md §10.6): "FAQ inline (home):
 * 5 questions, copy matches `app/routes/faq.tsx` source." Co-locating the
 * data in `app/lib/` (matching the `app/lib/integration-data.ts` pattern
 * used for hero + control-explorer) makes drift between the home inline
 * accordion and the dedicated /faq page impossible by construction.
 */

export type FAQ = { q: string; a: string };

export const FAQS: ReadonlyArray<FAQ> = [
  {
    q: "What is Spire?",
    a: "Spire is a compliance automation platform that connects to 30 production systems via read-only OAuth — AWS, GitHub, Google Workspace, Microsoft 365, Stripe, Okta, PagerDuty, BambooHR, and many more — and runs an AI compliance agent that evaluates the collected evidence against SOC 2 and EU AI Act controls. The same agent auto-fills enterprise security questionnaires with per-answer confidence scores.",
  },
  {
    q: "How is this different from a compliance checklist or spreadsheet?",
    a: "Instead of manually tracking evidence in spreadsheets, Spire connects directly to your systems and collects evidence automatically. Your compliance state updates in real time, not quarterly. Questionnaires get filled from live data, not from someone's memory.",
  },
  {
    q: "Do I still need a compliance consultant?",
    a: "Spire handles evidence collection, control mapping, and questionnaire autofill. For initial gap analysis, control design, and audit walkthroughs a consultant can still add value — but you'll need them for far fewer hours.",
  },
  {
    q: "Which frameworks do you support?",
    a: "SOC 2 (all five trust service criteria) and the EU AI Act (10 controls covering transparency, logging, human oversight, risk management, and more). ISO 27001 and GDPR evidence mapping are on the roadmap.",
  },
  {
    q: "How long does setup take?",
    a: "Connect your first integration in under 5 minutes. Within an hour you'll see your compliance state mapped to controls. Full setup with all integrations typically takes half a day.",
  },
  {
    q: "Can I try it before committing?",
    a: "Yes. Connect your GitHub repo and see your compliance state mapped in minutes — no credit card required.",
  },
  {
    q: "What access do you need to my systems?",
    a: "Read-only API access. We never modify your infrastructure, code, or configurations. Credentials are encrypted and can be revoked at any time.",
  },
  {
    q: "How accurate is the questionnaire autofill?",
    a: "Our AI auto-fills the majority of questions on first pass, depending on the complexity of the questionnaire and the evidence available. Every answer includes a confidence score, and uncertain answers are flagged for human review.",
  },
  {
    q: "What happens to my evidence data?",
    a: "Evidence is encrypted at rest (AES-256) and in transit (TLS 1.3). You control data retention and can export or delete everything at any time. We maintain separate data stores per customer.",
  },
  {
    q: "How does pricing work?",
    a: "We offer three plans: Starter (£200/mo), Growth (£1,200/mo), and Enterprise (from £3,000/mo). Annual billing saves 20%. You can start using Spire for free — no credit card required.",
  },
];
