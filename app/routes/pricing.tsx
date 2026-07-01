import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { StructuredData } from "~/components/structured-data";
import { pricingProductSchemas } from "~/lib/structured-data";
import { useState, useEffect } from "react";

import { INTEGRATION_NAMES } from "~/lib/integration-data";

export function meta() {
  return [
    { title: "Pricing | Spire — SOC 2 & EU AI Act compliance from £200/mo" },
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

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Pricing</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">Simple, transparent pricing</h1>
           <p className="mx-auto mt-4 max-w-xl text-lg text-[#8B8B93]">Connect integrations for free. Subscribe when you need to run audits or fill questionnaires.</p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-[#1C1C24] bg-[#111116] p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#5C5C66]">Every plan includes</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {core.map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-[#8B8B93]">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4AA]" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg><span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6">
          <div className="flex items-center gap-3">
            <label htmlFor={toggleId} className={`cursor-pointer text-sm select-none ${!annual ? "text-[#F1F1F3]" : "text-[#5C5C66]"}`}>Monthly</label>
            <input id={toggleId} type="checkbox" checked={annual} onChange={() => setAnnual(!annual)} className="sr-only peer" />
            <label htmlFor={toggleId} className={`relative block h-6 w-11 cursor-pointer rounded-full transition-colors ${annual ? "bg-[#00D4AA]" : "bg-[#1C1C24]"}`}>
              <span className={`absolute top-0.5 left-0.5 block h-5 w-5 rounded-full bg-white transition-transform ${annual ? "translate-x-5" : "translate-x-0"}`} />
            </label>
            <label htmlFor={toggleId} className={`cursor-pointer text-sm select-none ${annual ? "text-[#F1F1F3]" : "text-[#5C5C66]"}`}>Annual <span className="text-[#00D4AA]">(save ~17%)</span></label>
          </div>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}
            className="rounded-lg border border-[#1C1C24] bg-[#111116] px-3 py-1.5 text-sm text-[#8B8B93] focus:border-[#00D4AA] focus:outline-none">
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
              <div key={plan.name} className={`relative rounded-xl border p-8 ${plan.popular ? "border-[#00D4AA]/40 bg-[#111116]" : "border-[#1C1C24] bg-[#111116]"}`}>
                {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#00D4AA] px-4 py-0.5 text-xs font-medium text-black">Most popular</span>}
                <h2 className="text-xl font-bold text-[#F1F1F3]">{plan.name}</h2>
                <p className="mt-1 text-sm text-[#8B8B93]">{plan.desc}</p>
                <div className="mt-5 flex items-baseline gap-0.5">
                  <span className="text-4xl font-bold text-[#F1F1F3]">{fmt(price)}</span>
                  <span className="text-sm text-[#5C5C66]">{period}</span>
                </div>
                {annual && <p className="mt-1 text-xs text-[#5C5C66]">{fmt(plan.monthly)}/mo billed annually — save {fmt(plan.monthly * 12 - plan.annual)}/yr</p>}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-[#8B8B93]">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4AA]" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg><span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={plan.href} className={`mt-8 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${plan.popular ? "bg-[#00D4AA] text-black hover:bg-[#00B894]" : "border border-[#1C1C24] text-[#F1F1F3] hover:border-[#00D4AA]"}`}>{plan.cta}</Link>
              </div>
            );
          })}
        </div>
      </section>

    </PublicLayout>
  );
}
