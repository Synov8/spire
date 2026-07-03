import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";

export function meta() {
  return [
    { title: "AI | Spire" },
    { name: "description", content: "Spire's approach to AI — how our compliance agent uses AI, what models we rely on, how customer data is handled, and our AI governance framework." },
    { property: "og:title", content: "AI & Transparency | Spire" },
    { property: "og:type", content: "website" },
  ];
}

const sections = [
  {
    title: "How Spire uses AI",
    content: "Spire uses large language models (LLMs) to automate SOC 2 and EU AI Act compliance audits. Our compliance agent connects to your infrastructure accounts (GitHub, Stripe, Neon, Resend, Cloudflare), runs automated control checks against live configuration, and produces an audit report with evidence-backed verdicts. The agent streams its reasoning in real time so you can see exactly how each conclusion was reached.",
  },
  {
    title: "Models we use",
    content: "Our compliance agent uses DeepSeek V4 Flash accessed via OpenRouter. The model runs on OpenRouter's infrastructure — no data is sent to Spire's own servers for inference. We evaluate model providers on capability, latency, cost, and security posture before adoption.",
  },
  {
    title: "Data handling",
    content: "When you connect an integration to Spire, our compliance agent reads configuration and metadata from those services during an audit run. This data is processed by the LLM to generate audit findings. We do not train models on customer data. API credentials are stored encrypted and used only to make read-only requests to your connected accounts. Evidence data is retained per our privacy policy and deleted within 30 days of account cancellation.",
  },
  {
    title: "Human oversight",
    content: "All audit reports are reviewed by a human before being used for compliance decisions. Model outputs are validated against schemas and cross-referenced with live evidence. The agent's full reasoning trace is preserved so every verdict can be audited.",
  },
  {
    title: "AI governance",
    content: "We maintain an AI inventory covering all systems that incorporate AI, vendor due diligence records for each model provider, and a risk assessment specific to AI use cases. AI-generated content is clearly identified in our interface. Users interacting with AI features are informed via onboarding notices and our Terms of Service.",
  },
  {
    title: "Vendor due diligence",
    content: "OpenRouter (our LLM gateway) contractually agrees not to train on API data. DeepSeek (model provider) is evaluated for security and compliance. All subprocessors are reviewed annually for security certifications, data handling practices, and compliance with applicable regulations.",
  },
  {
    title: "Transparency & reporting",
    content: "This page is part of our commitment to AI transparency under the EU AI Act. We conduct regular audits of our AI systems and will publish updates as our AI capabilities evolve. If you have questions about our use of AI, contact ai@synov8studio.com.",
  },
];

export default function AiPage() {
  return (
    <PublicLayout>

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-24">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Transparency</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">AI & transparency</h1>
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
            Questions about our AI usage? Contact{" "}
            <a href="mailto:ai@synov8studio.com" className="text-[#00D4AA] hover:underline">ai@synov8studio.com</a>
          </p>
        </div>
      </section>

    </PublicLayout>
  );
}
