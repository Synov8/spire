import { Link } from "react-router";
import { auth } from "~/lib/auth.server";
import { PublicLayout } from "~/components/public-layout";
import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "Spire — AI-Powered SOC 2 & EU AI Act Compliance for B2B SaaS" },
    { name: "description", content: "Spire automates SOC 2 and EU AI Act compliance for B2B SaaS companies. Continuous evidence collection, AI-powered audit readiness, and automated security questionnaire responses." },
    { property: "og:title", content: "Spire — AI-Powered Compliance Automation" },
    { property: "og:description", content: "Automate SOC 2 and EU AI Act compliance with Spire's AI compliance agent." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://spire.synov8studio.com" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  return { loggedIn: !!session };
}

function Check({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>;
}

function ArrowRight() {
  return <svg className="ml-1 inline-block h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10m-3-4 4 4-4 4"/></svg>;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  if (loaderData.loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0C]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Spire</h1>
          <p className="mt-2 text-[#8B8B93]">You're signed in.</p>
          <Link to="/dashboard" className="mt-4 inline-block rounded-lg bg-[#00D4AA] px-6 py-2.5 font-medium text-black hover:bg-[#00B894]">
            Go to Dashboard <ArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PublicLayout>

      {/* HERO */}
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-16 text-center">
        <h1 className="animate-fade-up text-5xl font-extrabold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
          Stop losing enterprise deals<br />
          <span className="text-[#00D4AA]">to SOC 2, AI Act, and security questionnaires</span>
        </h1>
        <p className="animate-fade-up animate-fade-up-1 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#8B8B93]">
          We connect to your AWS, GitHub, Google Workspace, Vercel, Cloudflare, Clerk, Supabase, Stripe, and Resend — then automatically collect
          audit-ready evidence and fill security questionnaires in hours instead of weeks.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up animate-fade-up-2 mt-10 flex items-center justify-center gap-4">
          <Link
            to="/dashboard/questionnaires/upload"
            className="rounded-lg bg-[#00D4AA] px-6 py-3 font-semibold text-black hover:bg-[#00B894] transition-colors"
          >
            Upload a questionnaire <ArrowRight />
          </Link>
        </div>

        {/* Integration badges */}
        <div className="animate-fade-up animate-fade-up-3 mt-12 flex items-center justify-center gap-3 text-sm text-[#5C5C66]">
          <span className="flex items-center gap-1.5 rounded-full border border-[#1C1C24] px-3.5 py-1.5 text-[#8B8B93]">
            <span className="h-2 w-2 rounded-full bg-[#00D4AA]" />AWS
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-[#1C1C24] px-3.5 py-1.5 text-[#8B8B93]">
            <span className="h-2 w-2 rounded-full bg-[#00D4AA]" />GitHub
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-[#1C1C24] px-3.5 py-1.5 text-[#8B8B93]">
            <span className="h-2 w-2 rounded-full bg-[#00D4AA]" />Google Workspace
          </span>
        </div>

        {/* Subtext */}
        <p className="animate-fade-up animate-fade-up-3 mt-8 text-sm text-[#5C5C66]">
          Built for B2B SaaS teams preparing for SOC 2 or selling into enterprise.
        </p>
      </section>

      {/* SOCIAL PROOF */}
      <section className="border-y border-[#1C1C24] bg-[#111116]/50 py-10">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-[#5C5C66]">Trusted by teams shipping to enterprise</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-[#5C5C66]">
            <span className="text-[#8B8B93]">Series A–C SaaS</span>
            <span className="text-[#8B8B93]">Fast-growing AI startups</span>
            <span className="text-[#8B8B93]">SOC 2 candidates</span>
            <span className="text-[#8B8B93]">ISO 27001 teams</span>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#EF4444]">The problem</span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Compliance is slowing down your revenue
          </h2>
          <p className="mt-4 text-lg text-[#8B8B93]">
            If you're selling to enterprise, you already know the pattern.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              "Security questionnaires take days or weeks to complete",
              "SOC 2 evidence is scattered across a dozen tools",
              "Engineers get pulled into compliance work",
              "Deals stall in procurement for 'security review'",
              "Everything becomes a last-minute scramble before audits",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-[#1C1C24] bg-[#111116] p-4">
                <span className="mt-0.5 shrink-0 text-[#EF4444]">✕</span>
                <span className="text-[#B0B0B8]">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-lg font-semibold text-[#EF4444]">
            This doesn't scale — and it costs deals.
          </p>
        </div>
      </section>

      {/* THE SHIFT */}
      <section className="border-y border-[#1C1C24] bg-[#111116]/30 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">The shift</span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Compliance should run continuously —<br />
            <span className="text-[#00D4AA]">not be rebuilt for every audit</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[#8B8B93]">
            Instead of manually gathering evidence and answering repetitive security questions,
            your infrastructure should already know the answers. That's what we automate.
          </p>
        </div>
      </section>

      {/* PRODUCT */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">What it does</span>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          Spire connects to your stack<br />
          <span className="text-[#00D4AA]">and does the work for you</span>
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {/* Card 1 */}
          <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-bold">01</div>
            <h3 className="mt-5 text-xl font-bold">Continuous evidence collection</h3>
            <ul className="mt-4 space-y-3">
              {[
                ["AWS / GitHub", "infra, code, access controls"],
                ["Google / Vercel", "workspace audit, deployments"],
                ["Cloudflare / Clerk", "WAF, SSL, MFA, sessions"],
                ["Stripe / Supabase / Resend", "PCI, RLS, encryption — 9 total"],
              ].map(([label, desc]) => (
                <li key={label} className="flex items-start gap-3 text-sm text-[#8B8B93]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4AA]" />
                  <span><strong className="text-[#B0B0B8]">{label}</strong> — {desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-bold">02</div>
            <h3 className="mt-5 text-xl font-bold">Always-on compliance (SOC 2 + AI Act)</h3>
            <ul className="mt-4 space-y-3">
              {[
                "Maps your live systems to SOC 2 controls and EU AI Act requirements",
                "Identifies missing evidence with AI-powered gap analysis",
                "Continuously updated via Composio — no quarterly manual reviews",
              ].map((text) => (
                <li key={text} className="flex items-start gap-3 text-sm text-[#8B8B93]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4AA]" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-bold">03</div>
            <h3 className="mt-5 text-xl font-bold">Security questionnaire autopilot</h3>
            <ul className="mt-4 space-y-3">
              {[
                "Upload any vendor questionnaire (text, CSV, markdown, or PDF)",
                "AI auto-fills answers using your live evidence — confidence scored per question",
                "Attaches supporting evidence to every answer",
                "Flags only uncertain answers for human review",
              ].map((text) => (
                <li key={text} className="flex items-start gap-3 text-sm text-[#8B8B93]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4AA]" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 4 */}
          <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D4AA]/10 text-[#00D4AA] text-sm font-bold">04</div>
            <h3 className="mt-5 text-xl font-bold">Audit-ready export</h3>
            <ul className="mt-4 space-y-3">
              {[
                "Generate SOC 2 and AI Act compliance evidence packs in one click",
                "Timestamped, structured evidence bundle",
                "Share with auditors, prospects, or procurement",
                "No more digging through Slack for audit evidence",
              ].map((text) => (
                <li key={text} className="flex items-start gap-3 text-sm text-[#8B8B93]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4AA]" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="border-y border-[#1C1C24] bg-[#111116]/30 py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B8B93]">Before vs after</span>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-[#EF4444]/20 bg-[#111116] p-8">
              <h3 className="text-lg font-bold text-[#EF4444]">Before</h3>
              <ul className="mt-5 space-y-3 text-left">
                {[
                  "2–8 weeks of compliance work per review",
                  "Engineers pulled into evidence gathering",
                  "Security questionnaires slow down deal cycles",
                  "Audit prep chaos every year",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-[#8B8B93]">
                    <span className="mt-0.5 text-[#EF4444]">✕</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[#00D4AA]/20 bg-[#111116] p-8">
              <h3 className="text-lg font-bold text-[#00D4AA]">After</h3>
              <ul className="mt-5 space-y-3 text-left">
                {[
                  "Always audit-ready — no scramble",
                  "Questionnaires completed in hours, not weeks",
                  "Evidence collected automatically from live systems",
                  "Zero fire drills before audits",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-[#8B8B93]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4AA]" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">How it works</span>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Three steps to continuous compliance</h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            ["Connect your systems", "AWS, GitHub, Google Workspace, Vercel, Cloudflare, Clerk, Supabase, Stripe, Resend. Read-only integrations."],
            ["We map your compliance", "Controls, evidence, and risks are built automatically from live system data."],
            ["Continuous readiness", "Audit readiness becomes a background process. Questionnaires fill themselves."],
          ].map(([title, desc], i) => (
            <div key={i} className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1C1C24] text-sm font-bold text-[#00D4AA]">{i + 1}</div>
              <h3 className="mt-4 font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8B8B93]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY / TRUST */}
      <section className="border-y border-[#1C1C24] bg-[#111116]/30 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B8B93]">Security & Trust</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            We operate read-only integrations<br />
            <span className="text-[#00D4AA]">and never modify your infrastructure</span>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Read-only access", "To every connected system — no mutations, ever."],
              ["SOC 2-aligned", "Data handling follows the same standards we help you meet."],
              ["Encrypted storage", "All evidence encrypted at rest and in transit."],
              ["Full audit trail", "Every piece of collected data is timestamped and traceable."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-lg border border-[#1C1C24] bg-[#111116] p-5">
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#8B8B93]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
          Ready to stop losing deals<br />
          <span className="text-[#00D4AA]">to compliance delays?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-[#8B8B93]">
          See how much of your SOC 2 and security questionnaire workload can be automated.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard/questionnaires/upload"
            className="rounded-lg bg-[#00D4AA] px-7 py-3 font-semibold text-black hover:bg-[#00B894] transition-colors"
          >
            Upload a questionnaire <ArrowRight />
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-[#1C1C24] px-7 py-3 font-medium text-[#F1F1F3] hover:border-[#00D4AA] transition-colors"
          >
            Book a 15-minute demo
          </Link>
        </div>

        {/* Urgency */}
        <div className="mx-auto mt-16 max-w-xl rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-6 text-left">
          <p className="text-sm font-medium text-[#F59E0B]">Teams typically see ROI within the first security review.</p>
          <p className="mt-2 text-sm text-[#8B8B93]">
            If you're preparing for SOC 2, responding to enterprise security reviews, or closing B2B
            deals slowed by procurement — this is exactly where automation pays for itself immediately.
          </p>
        </div>
      </section>

    </PublicLayout>
  );
}
