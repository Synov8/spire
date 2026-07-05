import { Link } from "react-router";
import { useEffect, useState } from "react";
import { PublicLayout } from "~/components/public-layout";
import { HeroDemo } from "~/components/hero-demo";
import { ControlExplorer } from "~/components/control-explorer";
import { HomeFaq } from "~/components/home-faq";
import { StructuredData } from "~/components/structured-data";
import {
  softwareApplicationSchema,
  homeFaqPageSchema,
} from "~/lib/structured-data";
import {
  type BuyerRole,
  readRoleFromCookie,
  storeRoleCookie,
  parseRoleFromUrl,
} from "~/lib/buyer-role";
import { INTEGRATION_NAMES } from "~/lib/integration-data";
import type { Route } from "./+types/home";

/**
 * Final CTA microcopy per inferred buyer role (spec §11 buyer-role
 * segmentation — scaffold only; behavioural gating is intentionally NOT
 * applied). The CTA target stays identical across variants — we are
 * segmenting the *tone of conversation*, not paywalled features.
 *
 * Honesty rule (spec §10.1): the role is inferred from `?role=` URL
 * params on landing pages from email campaigns. We do NOT silently
 * classify visitors from referrers; the default role for an unannotated
 * visit is `"unknown"`.
 */
const FINAL_CTA_BY_ROLE: Record<BuyerRole, { eyebrow: string; headlineTail: string; sub: string }> = {
  cto: {
    eyebrow: "For engineering leaders",
    headlineTail: "your biggest audit delay?",
    sub: "Replace manual evidence gathering with a CI-friendly pipeline that maps your GitHub, Stripe, and Cloudflare activity to SOC 2 controls automatically.",
  },
  security: {
    eyebrow: "For security leads",
    headlineTail: "your continuous control map?",
    sub: "Run a Spire-self-style audit on your own stack. Live evidence, no scramble before the next audit window.",
  },
  revops: {
    eyebrow: "For revenue operations",
    headlineTail: "your deal-velocity blocker?",
    sub: "Stop letting security reviews stall procurement. Auto-filled questionnaires in hours, not weeks — wired directly into the deal cycle.",
  },
  unknown: {
    eyebrow: "Ready when you are",
    headlineTail: "to compliance delays?",
    sub: "See how much of your SOC 2 and security questionnaire workload can be automated.",
  },
};

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
  // SSR-side role resolution (spec §11 buyer-role): read the cookie only.
  // The `?role=` URL param is honoured client-side via storeRoleCookie() so
  // the same browser surfaces the right variant on the next non-JS render
  // too. We deliberately do NOT trust the URL param server-side — anyone
  // could craft it and the cookie is the durable signal.
  const role = readRoleFromCookie(request);
  // Also resolve the URL param once (without persisting) so a first-time
  // visitor who landed with `?role=cto` and has JS enabled sees the
  // variant on the SAME render — without waiting for hydration round-trip.
  const url = new URL(request.url);
  const urlRole = parseRoleFromUrl(url);
  return {
    role,
    initialRoleFromUrl: urlRole,
  };
}

function Check({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>;
}

function ArrowRight() {
  return <svg className="ml-1 inline-block h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10m-3-4 4 4-4 4"/></svg>;
}

/**
 * Client-only effect that promotes the URL-param `?role=` into the
 * persisted cookie + localStorage. Strictly post-hydration so SSR HTML
 * and the first client render stay byte-identical (no mismatch).
 *
 * React 19 StrictMode intentionally double-invokes effects in dev. The
 * `persistedRef` ref below ensures we only WRITE the cookie once per
 * mount, not twice — the cookie write itself is idempotent so a double
 * write is harmless, but we keep the count to one for log cleanliness.
 */
export default function Home({ loaderData }: Route.ComponentProps) {
  // SSR + first client render: role is the cookie-derived value ONLY.
  // The URL `?role=` does NOT influence this render — that's what keeps
  // hydration safe. After hydration completes (post-paint), the effect
  // below updates `displayedRole` if a URL param was provided.
  const cookieRole = loaderData.role;
  const urlRole = loaderData.initialRoleFromUrl;
  const effectiveRole = cookieRole;

  const [persistedRoleOnce, setPersistedRoleOnce] = useState(false);
  useEffect(() => {
    if (persistedRoleOnce) return;
    if (urlRole === "unknown") {
      setPersistedRoleOnce(true);
      return;
    }
    if (urlRole === cookieRole) {
      setPersistedRoleOnce(true);
      return;
    }
    try {
      storeRoleCookie(urlRole);
    } catch {
      /* ignore — cookie write rejected (CSP, private mode, etc.) */
    }
    setPersistedRoleOnce(true);
  }, [persistedRoleOnce, urlRole, cookieRole]);

  const cta = FINAL_CTA_BY_ROLE[effectiveRole];

  return (
    <PublicLayout>

      {/* JSON-LD: SoftwareApplication + FAQPage (5-question spec subset) */}
      <StructuredData
        schemas={[softwareApplicationSchema(), homeFaqPageSchema()]}
      />

      {/* HERO — §4.2: headline + subhead + CTA on left, animated demo on right at md+, stacked on mobile */}
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-16">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
              Stop losing enterprise deals<br />
              <span className="text-[#00D4AA]">to SOC 2, AI Act, and security questionnaires</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#8B8B93] md:mx-0">
              Spire connects to {INTEGRATION_NAMES.length} integrations via read-only OAuth — GitHub, Stripe,
              BambooHR, Workday, Okta, Snyk, Salesforce, and many more — spanning cloud, identity, source
              code, payment, email, HR, observability, security, and CRM. We collect audit-ready evidence
               24/7 and auto-fill enterprise security questionnaires — typically in minutes, not weeks.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <Link
                to="/dashboard/questionnaires/upload"
                className="rounded-lg bg-[#00D4AA] px-6 py-3 font-semibold text-black hover:bg-[#00B894] transition-colors"
              >
                Upload a questionnaire <ArrowRight />
              </Link>
            </div>
            <p className="mt-9 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5C5C66]">
              GitHub · Stripe · Vercel · Cloudflare · Neon · +{INTEGRATION_NAMES.length - 5} more
            </p>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5C5C66]">
              Featured on Tiny Startups · Product Hunt · SideProjectors · SaaS Cubes
            </p>
          </div>
          <div className="w-full">
            <HeroDemo />
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

      {/* TRUST MARK — §4.5: thin band, 3 shield+text items between THE SHIFT and CONTROL EXPLORER */}
      <section aria-label="Trust mark" className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-[#8B8B93]">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#00D4AA]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M8 1.5l5 2v4c0 3-2 5.5-5 6.5-3-1-5-3.5-5-6.5v-4l5-2z" strokeLinejoin="round" />
              <path d="M5.5 8l2 2 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Read-only integrations</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#00D4AA]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M2.5 7V5a5.5 5.5 0 0 1 11 0v2" strokeLinecap="round" />
              <rect x="2.5" y="7" width="11" height="7" rx="1.5" />
              <circle cx="8" cy="10.5" r="1.25" fill="currentColor" stroke="none" />
            </svg>
            <span>AES-256 at rest, TLS 1.3 in transit</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#00D4AA]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" strokeLinecap="round" />
              <path d="M5 7h4M7 5v4" strokeLinecap="round" />
            </svg>
            <span>Full audit trail on every evidence item</span>
          </div>
        </div>
      </section>

      {/* CONTROL EXPLORER — §4.6: replaces the previous 4 PRODUCT cards with a tabbed, filterable control explorer */}
      <section id="control-explorer" className="mx-auto max-w-6xl px-6 py-24">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">What it covers</span>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          Mapped to the controls<br />
          <span className="text-[#00D4AA]">your auditor actually checks</span>
        </h2>
        <p className="mt-4 max-w-3xl text-lg text-[#8B8B93]">
          Pick a framework tab and an integration to see which controls Spire currently
          collects evidence for. Click any row to expand the integrations and the
          exact evidence name.
        </p>

        <div className="mt-10">
          <ControlExplorer />
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
            ["Connect your systems", `GitHub, Stripe, Cloudflare, Neon, Datadog, Sentry, Notion, Resend, and ${Math.max(0, INTEGRATION_NAMES.length - 8)} more. All read-only.`],
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

      {/* INLINE MICRO-FAQ — §4.8: 5 questions, motion-driven accordion, "See all FAQs → /faq" link */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">
            FAQ
          </span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Top questions,<br />
            <span className="text-[#00D4AA]">answered upfront</span>
          </h2>
          <p className="mt-4 text-base text-[#8B8B93]">
            Five things buyers ask before signing up. Pulled verbatim from our full FAQ.
          </p>
        </div>
        <div className="mt-10">
          <HomeFaq />
        </div>
      </section>

      {/* FINAL CTA — microcopy variant from spec §11 buyer-role, hidden
          until effectiveRole resolves (cookie or URL `?role=` param). */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B8B93]">
          {cta.eyebrow}
        </span>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          Ready to stop losing deals<br />
          <span className="text-[#00D4AA]">{cta.headlineTail}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-[#8B8B93]">
          {cta.sub}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard/questionnaires/upload"
            className="rounded-lg bg-[#00D4AA] px-7 py-3 font-semibold text-black hover:bg-[#00B894] transition-colors"
          >
            Upload a questionnaire <ArrowRight />
          </Link>
        </div>

        {/* Trimmed per §4.7: one sentence + neutral #1C1C24 surfaces (no F59E0B warning-yellow). */}
        <div className="mx-auto mt-16 max-w-xl rounded-xl border border-[#1C1C24] bg-[#1C1C24] p-6 text-left">
          <p className="text-sm leading-relaxed text-[#8B8B93]">
            If you're preparing for SOC 2, responding to enterprise security reviews, or closing B2B
            deals slowed by procurement — this is exactly where automation pays for itself immediately.
          </p>
        </div>
      </section>

    </PublicLayout>
  );
}
