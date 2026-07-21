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
  breadcrumbListSchema,
} from "~/lib/structured-data";
import {
  type BuyerRole,
  readRoleFromCookie,
  storeRoleCookie,
  parseRoleFromUrl,
} from "~/lib/buyer-role";
import { INTEGRATION_NAMES } from "~/lib/integration-data";
import type { Route } from "./+types/home";

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
    sub: "Stop letting security reviews stall procurement. Auto-filled questionnaires in hours, not weeks - wired directly into the deal cycle.",
  },
  unknown: {
    eyebrow: "Ready when you are",
    headlineTail: "to compliance delays?",
    sub: "See how much of your SOC 2 and security questionnaire workload can be automated.",
  },
};

export function meta() {
  return [
    { title: "Spire - AI-Powered SOC 2 & EU AI Act Compliance for B2B SaaS" },
    { name: "description", content: "Spire automates SOC 2 and EU AI Act compliance for B2B SaaS companies. Continuous evidence collection, AI-powered audit readiness, and automated security questionnaire responses." },
    { property: "og:title", content: "Spire - AI-Powered Compliance Automation" },
    { property: "og:description", content: "Automate SOC 2 and EU AI Act compliance with Spire's AI compliance agent." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://spire.synov8studio.com" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const role = readRoleFromCookie(request);
  const url = new URL(request.url);
  const urlRole = parseRoleFromUrl(url);
  return { role, initialRoleFromUrl: urlRole };
}

function Check({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>;
}

function ArrowRight() {
  return <svg className="ml-1 inline-block h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10m-3-4 4 4-4 4"/></svg>;
}

const INTEGRATION_PILLS = [
  "GitHub", "Stripe", "Vercel", "Cloudflare", "Neon",
  "AWS", "Datadog", "Okta", "Sentry", "Linear",
  "Google Workspace", "Microsoft 365", "GitLab", "Slack",
  "Jira", "Resend", "Notion", "Confluence",
];

export default function Home({ loaderData }: Route.ComponentProps) {
  const cookieRole = loaderData.role;
  const urlRole = loaderData.initialRoleFromUrl;

  const [persistedRoleOnce, setPersistedRoleOnce] = useState(false);
  useEffect(() => {
    if (persistedRoleOnce) return;
    if (urlRole === "unknown") { setPersistedRoleOnce(true); return; }
    if (urlRole === cookieRole) { setPersistedRoleOnce(true); return; }
    try { storeRoleCookie(urlRole); } catch { /* ignore */ }
    setPersistedRoleOnce(true);
  }, [persistedRoleOnce, urlRole, cookieRole]);

  const cta = FINAL_CTA_BY_ROLE[cookieRole];

  return (
    <PublicLayout>

      <StructuredData schemas={[
        softwareApplicationSchema(),
        homeFaqPageSchema(),
        breadcrumbListSchema([{ name: "Home", url: "/" }]),
      ]} />

      {/* ─── HERO: Asymmetric split ─── */}
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center overflow-x-hidden px-6 pt-8 pb-12 md:pt-16">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
              Stop losing enterprise deals
              <span className="mt-1 block text-brand">to compliance delays</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-secondary md:mx-0 md:text-base">
              Spire connects to {INTEGRATION_NAMES.length} integrations via read-only OAuth.
              Collects audit-ready evidence 24/7 and auto-fills security questionnaires in minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link
                to="/dashboard/questionnaires/upload"
                className="inline-flex h-11 items-center rounded-[20px] bg-brand px-6 text-sm font-semibold text-black transition-all hover:bg-brand-dark hover:scale-[0.97] active:scale-[0.95]"
              >
                Upload a questionnaire <ArrowRight />
              </Link>
              <Link
                to="/integrations"
                className="inline-flex h-11 items-center rounded-[20px] border border-border-primary px-6 text-sm font-medium text-text-secondary transition-all hover:border-brand/40 hover:text-text-primary hover:scale-[0.97] active:scale-[0.95]"
              >
                View integrations
              </Link>
            </div>
          </div>
          <div className="w-full">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* ─── TRUST STRIP: Integration pills + badges ─── */}
      <section aria-label="Trusted by" className="border-y border-border-primary bg-surface-secondary/50 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-4 text-center text-xs font-medium text-text-tertiary">
            {INTEGRATION_NAMES.length} integrations &middot; Featured on Tiny Startups, Product Hunt, and more
          </p>
          <div className="relative overflow-hidden mask-fade-x">
            <div className="flex w-max animate-scroll items-center gap-3">
              {[...Array(3)].flatMap(() =>
                INTEGRATION_PILLS.map((name) => (
                  <span
                    key={name}
                    className="inline-flex h-8 shrink-0 items-center rounded-full border border-border-primary bg-surface-tertiary px-3.5 text-xs font-medium text-text-secondary"
                  >
                    {name}
                  </span>
                )),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROBLEM: Compliance is a deal blocker ─── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Enterprise compliance is a revenue problem
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary md:text-base">
              If you're selling to enterprise, you already know the pattern. Security
              questionnaires take weeks. SOC 2 evidence is scattered across a dozen tools.
              Engineers get pulled into compliance work. Deals stall in procurement.
            </p>
            <div className="mt-8 space-y-3">
              {[
                "Security questionnaires take days or weeks to complete",
                "SOC 2 evidence scattered across a dozen tools",
                "Engineers pulled out of product work for compliance",
                "Deals stall in procurement for 'security review'",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-error-subtle text-[10px] text-error">!!</span>
                  <span className="text-sm text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: "2-8 weeks", label: "per security review" },
              { stat: "40 hours", label: "avg questionnaire fill time" },
              { stat: "3-5", label: "engineers pulled per audit" },
              { stat: "80%", label: "of deals have security reqs" },
            ].map(({ stat, label }) => (
              <div key={stat} className="rounded-xl border border-border-primary bg-surface-secondary p-5">
                <p className="text-2xl font-bold tracking-tight text-text-primary">{stat}</p>
                <p className="mt-1 text-xs text-text-tertiary">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SHIFT: Continuous compliance ─── */}
      <section className="border-y border-border-primary bg-surface-secondary/30 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Compliance should run continuously
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-secondary md:text-base">
            Instead of manually gathering evidence for every audit or security review, your
            infrastructure should already know the answers. That's what we automate.
          </p>
        </div>
      </section>

      {/* ─── CONTROL EXPLORER ─── */}
      <section id="control-explorer" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Mapped to the controls
          <span className="mt-1 block text-brand">your auditor actually checks</span>
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-text-secondary md:text-base">
          Pick a framework tab and an integration to see which controls Spire currently
          collects evidence for. Click any row to expand details.
        </p>
        <div className="mt-10">
          <ControlExplorer />
        </div>
      </section>

      {/* ─── HOW IT WORKS: 3 steps ─── */}
      <section className="border-y border-border-primary bg-surface-secondary/30 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            Three steps to continuous compliance
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Connect your systems",
                desc: `GitHub, Stripe, Cloudflare, Neon, Datadog, Notion, Resend, and ${Math.max(0, INTEGRATION_NAMES.length - 7)} more. All read-only OAuth, no agents.`,
              },
              {
                step: "02",
                title: "We map your controls",
                desc: "Controls, evidence, and risks are built automatically from live system data. Mapped to SOC 2 and EU AI Act frameworks.",
              },
              {
                step: "03",
                title: "Continuous readiness",
                desc: "Audit readiness becomes a background process. Questionnaires fill themselves. No more fire drills.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="rounded-xl border border-border-primary bg-surface-secondary p-6">
                <span className="font-mono text-xs font-semibold tracking-wider text-brand">{step}</span>
                <h3 className="mt-3 text-lg font-bold text-text-primary">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE DIFFERENCE: Before vs After ─── */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
          The difference
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-error/20 bg-surface-secondary p-8">
            <h3 className="text-lg font-bold text-error">Before</h3>
            <ul className="mt-6 space-y-4">
              {[
                "2-8 weeks of compliance work per review",
                "Engineers pulled into evidence gathering",
                "Security questionnaires slow down deal cycles",
                "Audit prep chaos every year",
              ].map((text) => (
                <li key={text} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="mt-0.5 text-error">!!</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-brand/20 bg-surface-secondary p-8">
            <h3 className="text-lg font-bold text-brand">After</h3>
            <ul className="mt-6 space-y-4">
              {[
                "Always audit-ready - no scramble",
                "Questionnaires completed in hours, not weeks",
                "Evidence collected automatically from live systems",
                "Zero fire drills before audits",
              ].map((text) => (
                <li key={text} className="flex items-start gap-3 text-sm text-text-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── SECURITY & TRUST ─── */}
      <section className="border-y border-border-primary bg-surface-secondary/30 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
            Read-only access, full audit trail
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-text-secondary">
            We never modify your infrastructure. Every piece of collected data is timestamped and traceable.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Read-only access", "To every connected system - no mutations, ever."],
              ["SOC 2-aligned", "Data handling follows the same standards we help you meet."],
              ["Encrypted storage", "All evidence encrypted at rest and in transit."],
              ["Full audit trail", "Every piece of collected data is timestamped and traceable."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl border border-border-primary bg-surface-secondary p-5">
                <h3 className="text-sm font-bold text-text-primary">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Top questions, answered upfront
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-text-secondary">
            Five things buyers ask before signing up. Pulled verbatim from our full FAQ.
          </p>
        </div>
        <div className="mt-10">
          <HomeFaq />
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Ready to stop losing deals
          <span className="mt-1 block text-brand">{cta.headlineTail}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-text-secondary">
          {cta.sub}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard/questionnaires/upload"
            className="inline-flex h-12 items-center rounded-[20px] bg-brand px-8 text-base font-semibold text-black transition-all hover:bg-brand-dark hover:scale-[0.97] active:scale-[0.95]"
          >
            Upload a questionnaire <ArrowRight />
          </Link>
        </div>
        <div className="mx-auto mt-16 max-w-xl rounded-xl border border-border-primary bg-surface-secondary p-6 text-left">
          <p className="text-sm leading-relaxed text-text-secondary">
            If you're preparing for SOC 2, responding to enterprise security reviews, or closing B2B
            deals slowed by procurement - this is exactly where automation pays for itself immediately.
          </p>
        </div>
      </section>

    </PublicLayout>
  );
}
