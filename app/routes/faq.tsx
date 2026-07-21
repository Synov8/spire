import { useState } from "react";
import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { StructuredData } from "~/components/structured-data";
import { organizationSchema, breadcrumbListSchema, faqPageSchema } from "~/lib/structured-data";
import { FAQS as faqs } from "~/lib/faq-data";

export function meta() {
  return [
    { title: "FAQ | Spire - SOC 2 & EU AI Act Compliance Questions" },
    { name: "description", content: "Frequently asked questions about SOC 2 compliance automation, EU AI Act requirements, Spire pricing, evidence collection, auditor selection, and compliance timelines for B2B SaaS." },
    { property: "og:title", content: "FAQ | Spire" },
    { property: "og:type", content: "website" },
  ];
}

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <PublicLayout>
      <StructuredData schemas={breadcrumbListSchema([
        { name: "Home", url: "/" },
        { name: "FAQ", url: "/faq" },
      ])} />
      <StructuredData schemas={faqPageSchema(faqs.map(f => ({ question: f.q, answer: f.a })))} />

      <section className="mx-auto max-w-3xl px-6 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">Frequently asked questions</h1>
        </div>

        <div className="mt-14 space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border-primary bg-surface-secondary">
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-surface-primary/50 rounded-xl">
                <span className="text-sm font-medium text-text-primary pr-4">{faq.q}</span>
                <svg className={`h-4 w-4 shrink-0 text-text-tertiary transition-transform ${open === i ? "rotate-180" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              {open === i && (
                <div className="border-t border-border-primary px-6 py-4">
                  <p className="text-sm leading-relaxed text-text-secondary">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-border-primary bg-surface-secondary p-8 text-center">
          <h2 className="text-lg font-bold text-text-primary">Still have questions?</h2>
          <p className="mt-2 text-sm text-text-secondary">We're here to help.</p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Link to="/blog" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Visit our blog</Link>
            <Link to="/contact" className="inline-flex h-11 items-center rounded-[20px] bg-brand px-6 text-sm font-semibold text-black transition-all hover:bg-brand-dark hover:scale-[0.97] active:scale-[0.95]">
              Contact us
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
