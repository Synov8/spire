import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { StructuredData } from "~/components/structured-data";
import { pricingProductSchemas, breadcrumbListSchema } from "~/lib/structured-data";
import { useState, useEffect } from "react";

import { INTEGRATION_NAMES } from "~/lib/integration-data";

export function meta() {
  return [
    { title: "Pricing | Spire - SOC 2 & EU AI Act compliance from £200/mo" },
    {
      name: "description",
      content: `Spire pricing: Starter £200/mo, Growth £1,200/mo, Enterprise £3,000/mo. All plans include the AI compliance agent, continuous evidence collection across ${INTEGRATION_NAMES.length} integrations, and AI questionnaire autofill. Annual billing saves ~17%. Live currency conversion (USD/EUR) on this page. No sales call, no setup fee, no per-auditor charge.`,
    },
    { property: "og:title", content: "Pricing | Spire" },
    { property: "og:type", content: "website" },
  ];
}

const symbols: Record<string, string> = { gbp: "£", usd: "$", eur: "€" };

async function fetchRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/GBP");
    if (!res.ok) throw Error();
    const data = await res.json() as { rates: Record<string, number> };
    return { gbp: 1, usd: data.rates.USD, eur: data.rates.EUR };
  } catch {
    return { gbp: 1, usd: 1.27, eur: 1.16 }; // fallback
  }
}

import { plans } from "~/lib/plans";

const core = [
  `Continuous evidence collection via read-only OAuth (${INTEGRATION_NAMES.length} integrations and growing)`,
  "Full SOC 2 common-criteria and EU AI Act article mapping",
  "AI-driven security questionnaire autofill with per-answer confidence scores",
  "Audit-ready evidence pack export (JSON, structured by framework)",
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [currency, setCurrency] = useState("gbp");
  const [rates, setRates] = useState<Record<string, number>>({ gbp: 1, usd: 1.27, eur: 1.16 });

  useEffect(() => {
    fetchRates().then(setRates);
    const locale = navigator.language?.split("-")[1]?.toLowerCase();
    if (locale === "us") setCurrency("usd");
    else if (locale === "de" || locale === "fr" || locale === "nl") setCurrency("eur");
  }, []);

  const r = rates[currency] || 1;
  const s = symbols[currency] || "£";
  const fmt = (n: number) => s + Math.round(n * r).toLocaleString();
  const toggleId = "billing-toggle";

  return (
    <PublicLayout>

      {/* JSON-LD: one Product per pricing tier (Starter / Growth / Enterprise) */}
      <StructuredData schemas={pricingProductSchemas()} />
      <StructuredData schemas={breadcrumbListSchema([
        { name: "Home", url: "/" },
        { name: "Pricing", url: "/pricing" },
      ])} />

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">Simple, transparent pricing</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">Connect integrations for free. Subscribe when you need to run audits or fill questionnaires.</p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-border-primary bg-surface-secondary p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">Every plan includes</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {core.map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg><span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6">
          <div className="flex items-center gap-3">
            <label htmlFor={toggleId} className={`cursor-pointer text-sm select-none ${!annual ? "text-text-primary" : "text-text-tertiary"}`}>Monthly</label>
            <input id={toggleId} type="checkbox" checked={annual} onChange={() => setAnnual(!annual)} className="sr-only peer" />
            <label htmlFor={toggleId} className={`relative block h-6 w-11 cursor-pointer rounded-full transition-colors ${annual ? "bg-brand" : "bg-border-primary"}`}>
              <span className={`absolute left-0.5 top-0.5 block h-5 w-5 rounded-full bg-white transition-transform ${annual ? "translate-x-5" : "translate-x-0"}`} />
            </label>
            <label htmlFor={toggleId} className={`cursor-pointer text-sm select-none ${annual ? "text-text-primary" : "text-text-tertiary"}`}>Annual <span className="text-brand">(save ~17%)</span></label>
          </div>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}
            className="rounded-lg border border-border-primary bg-surface-secondary px-3 py-1.5 text-sm text-text-secondary focus:border-brand focus:outline-none">
            <option value="gbp">GBP £</option>
            <option value="usd">USD $</option>
            <option value="eur">EUR €</option>
          </select>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const price = annual ? plan.annual : plan.monthly;
            const period = annual ? "/yr" : "/mo";
            return (
              <div key={plan.name} className={`relative rounded-xl border p-8 ${plan.popular ? "border-brand/40 bg-surface-secondary" : "border-border-primary bg-surface-secondary"}`}>
                {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-4 py-0.5 text-xs font-medium text-black">Most popular</span>}
                <h2 className="text-xl font-bold text-text-primary">{plan.name}</h2>
                <p className="mt-1 text-sm text-text-secondary">{plan.desc}</p>
                <div className="mt-5 flex items-baseline gap-0.5">
                  <span className="text-4xl font-bold text-text-primary">{fmt(price)}</span>
                  <span className="text-sm text-text-tertiary">{period}</span>
                </div>
                {annual && <p className="mt-1 text-xs text-text-tertiary">{fmt(plan.monthly)}/mo billed annually. Save {fmt(plan.monthly * 12 - plan.annual)}/yr</p>}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-text-secondary">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg><span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={plan.href} className={`mt-8 flex w-full h-11 items-center justify-center rounded-[20px] px-6 text-sm font-semibold transition-all hover:scale-[0.97] active:scale-[0.95] ${plan.popular ? "bg-brand text-black hover:bg-brand-dark" : "border border-border-primary text-text-secondary font-medium hover:border-brand/40 hover:text-text-primary"}`}>{plan.cta}</Link>
              </div>
            );
          })}
        </div>
      </section>

    </PublicLayout>
  );
}
