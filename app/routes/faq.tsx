import { useState } from "react";
import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { FAQS as faqs } from "~/lib/faq-data";

export function meta() {
  return [
    { title: "FAQ | Spire — SOC 2 & EU AI Act Compliance Questions" },
    { name: "description", content: "Frequently asked questions about SOC 2 compliance automation, EU AI Act requirements, Spire pricing, evidence collection, auditor selection, and compliance timelines for B2B SaaS." },
    { property: "og:title", content: "FAQ | Spire" },
    { property: "og:type", content: "website" },
  ];
}

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <PublicLayout>

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-24">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">FAQ</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">Frequently asked questions</h1>
        </div>

        <div className="mt-14 space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-[#1C1C24] bg-[#111116]">
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[#0A0A0C]/50 rounded-xl">
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
          <div className="mt-4 flex items-center justify-center gap-4">
            <Link to="/blog" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Visit our blog</Link>
            <Link to="/contact" className="inline-block rounded-lg bg-[#00D4AA] px-6 py-2.5 text-sm font-medium text-black hover:bg-[#00B894] transition-colors">
              Contact us
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
