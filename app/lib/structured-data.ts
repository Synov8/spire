/**
 * JSON-LD schema factories — single source of truth for structured-data
 * payload rendered by `<StructuredData />` on each public route.
 *
 * Per home-overhaul-spec.md §5.2 + §11 (deferred → now shipped):
 *   • SoftwareApplication on /
 *   • FAQPage on / (5 visible questions — same set HomeFaq shows)
 *   • Product × 3 on /pricing (one per plan tier)
 *   • Organization on /trust-center
 *   • ItemList on /integrations
 *   • Service per /integrations/:slug (bonus)
 *
 * Each factory returns a plain JSON-serialisable object. The component
 * (app/components/structured-data.tsx) renders one or more as
 * `<script type="application/ld+json">` blocks.
 *
 * Conventions:
 *   • "@context" is always "https://schema.org" (canonical, Google-validated).
 *   • All currency numerics are positive numbers, ISO-4217 currency code.
 *   • URLs are absolute (Google requires absolute URLs in structured data).
 *
 * FAQ-page policy note (Google Search Central):
 *   FAQPage rich-result eligibility expects the SAME Q&A content to be
 *   discoverable from the page DOM. On /, the on-screen `<HomeFaq>`
 *   uses motion-gated conditional rendering (`<AnimatePresence>` +
 *   `open === i`), so the SSR HTML for closed accordion items does NOT
 *   inline the answer text. We rely on the JSON-LD's
 *   `mainEntity[].acceptedAnswer.text` carrying the answers verbatim —
 *   Google parses structured data from
 *   `<script type="application/ld+json">` blocks independently of which
 *   DOM nodes are visually rendered, so closed-state items remain
 *   discoverable to crawlers. This avoids drift between visible copy
 *   and structured-data payload (both pull from the canonical FAQS
 *   constant in app/lib/faq-data.ts).
 *
 *   Trade-off acknowledged: if a future Google validator cross-checks
 *   the rendered DOM text against the JSON-LD answers, closed accordion
 *   items may flag as anomalies. A future enhancement would embed a
 *   server-rendered `<script type="application/json">` data-island with
 *   all 5 answers inside the HomeFaq accordion container so the DOM
 *   carries the entries regardless of which item is currently expanded.
 */

import { INTEGRATIONS } from "~/lib/integration-data";
import { FAQS } from "~/lib/faq-data";
import { plans } from "~/lib/plans";

export const SITE_URL = "https://spire.synov8studio.com";
export const LEGAL_NAME = "Synov8 Ltd.";
export const SUPPORT_EMAIL = "hello@synov8studio.com";

// The 5 questions HomeFaq shows on the home page (spec order, §4.8 + §10.6).
// Used by both the visible accordion AND the FAQPage JSON-LD so they cannot
// drift: same canonical FAQS source, same selection, same ordering.
export const HOME_FAQ_QUESTIONS = [
  "What is Spire?",
  "Do I still need a compliance consultant?",
  "What access do you need to my systems?",
  "How accurate is the questionnaire autofill?",
  "How long does setup take?",
] as const;

const faqByQuestion = new Map(FAQS.map((f) => [f.q, f]));

/**
 * Schema.org base type — narrow enough that callers can't accidentally
 * omit the two required fields ("@context", "@type") but wide enough that
 * each factory can set its own optional properties.
 */
export type Schema = {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
};

// ─── WebSite (every page) ───────────────────────────────────────────────────

/**
 * WebSite schema — enables Google Sitelinks Search Box and helps AI
 * chatbots understand the site as a whole. Included on every public page
 * via PublicLayout.
 */
export function webSiteSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Spire",
    url: SITE_URL,
    description:
      "AI-powered SOC 2 and EU AI Act compliance automation for B2B SaaS.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ─── BreadcrumbList (per-page) ──────────────────────────────────────────────

/**
 * BreadcrumbList schema — helps LLMs understand page hierarchy.
 * Each route passes its breadcrumb trail. Example:
 *
 *   breadcrumbListSchema([
 *     { name: "Home", url: "/" },
 *     { name: "Blog", url: "/blog" },
 *     { name: post.title, url: `/blog/${post.slug}` },
 *   ])
 */
export type Crumb = { name: string; url: string };

export function breadcrumbListSchema(crumbs: Crumb[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.url}`,
    })),
  };
}

// ─── / ────────────────────────────────────────────────────────────────────

/**
 * SoftwareApplication — Spire as the SaaS product.
 *
 * Required (per Google + Schema.org):
 *   • name                 — "Spire"
 *   • applicationCategory  — "BusinessApplication"
 *   • operatingSystem      — "Web (Cloudflare Workers)"
 *   • offers (Offer)       — free tier with explicit 0 USD price
 *
 * Optional we set:
 *   • description, url, featureList (multi-line), provider (Organization).
 */
export function softwareApplicationSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Spire",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      `AI-powered SOC 2 and EU AI Act compliance automation for B2B SaaS — continuous evidence collection across ${INTEGRATIONS.length} integrations via read-only OAuth, AI questionnaire autofill, and audit-ready exports.`,
    url: SITE_URL,
    provider: { "@type": "Organization", name: "Spire", url: SITE_URL },
    offers: {
      "@type": "Offer",
      price: "200",
      priceCurrency: "GBP",
      description: "Starts at £200/month. See /pricing for all plans.",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      `Continuous evidence collection via read-only OAuth (${INTEGRATIONS.length} integrations: ${INTEGRATIONS.map((i) => i.name).join(", ")}).`,
      "AI-powered auto-fill of enterprise security questionnaires with per-answer confidence scoring.",
      "SOC 2 controls mapping (56 common criteria, all five trust service criteria).",
      "EU AI Act controls mapping (10 articles covering transparency, logging, human oversight, risk management).",
      "Audit-ready evidence pack export (PDF + CSV bundle).",
    ].join(" • "),
  };
}

/**
 * FAQPage — 5 questions shown on the home page (spec §4.8 + §10.6).
 * Pulled from the canonical FAQS constant via the same spec-ordered
 * HOME_FAQ_QUESTIONS list used by the on-screen HomeFaq component.
 *
 * The answer text is included verbatim here (rather than referencing the
 * DOM-rendered text by id) so Google parses the answers from JSON-LD alone,
 * independent of which accordion items the user has expanded.
 */
export function homeFaqPageSchema(): Schema {
  const mainEntity = HOME_FAQ_QUESTIONS
    .map((q) => faqByQuestion.get(q))
    .filter((f): f is (typeof FAQS)[number] => Boolean(f))
    .map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

// ─── /pricing ─────────────────────────────────────────────────────────────

/**
 * Product schemas — one per pricing tier.
 *
 * Google allows Product schema for SaaS pricing tier cards (per Google
 * Search Central 2024-2026 guidance) when each Product represents a
 * distinct purchaseable subscription tier with a concrete Offer.
 *
 * Required per tier:
 *   • name                                  — "Starter plan — Spire" / etc.
 *   • brand (Brand)                         — "Spire"
 *   • offers.price + priceCurrency          — monthly GBP
 *   • offers.priceSpecification (multiple)  — monthly AND annual UnitPriceSpecification
 *   • category                              — "Software"
 */
export function pricingProductSchemas(): Schema[] {
  return plans.map((plan) => {
    const productName = `${plan.name} plan — Spire`;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: productName,
      description: plan.desc,
      category: "Software",
      brand: { "@type": "Brand", name: "Spire", url: SITE_URL },
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}${plan.href}`,
        price: plan.monthly,
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        priceSpecification: [
          {
            "@type": "UnitPriceSpecification",
            price: plan.monthly,
            priceCurrency: "GBP",
            unitCode: "MON",
            description: "Monthly billing, billed monthly.",
          },
          {
            "@type": "UnitPriceSpecification",
            price: plan.annual,
            priceCurrency: "GBP",
            unitCode: "ANN",
            referenceQuantity: {
              "@type": "QuantitativeValue",
              value: 12,
              unitCode: "MON",
            },
            description: "Annual billing — saves ~17% vs monthly.",
          },
        ],
      },
    };
  });
}

// ─── /trust-center ────────────────────────────────────────────────────────

/**
 * Organization — Spire as the legal entity (Synov8 Ltd.).
 *
 * Provides the contact-point + sameAs Google uses for the company
 * knowledge panel. We do NOT pretend to be SOC 2 certified; the
 * description mirrors the canonical /trust-center wording.
 */
export function organizationSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Spire",
    legalName: LEGAL_NAME,
    url: SITE_URL,
    description:
      "Synov8 Ltd. operates Spire — an AI-powered SOC 2 and EU AI Act compliance automation platform for B2B SaaS companies. Spire uses Spire to audit itself; see /trust-center for live posture.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: SUPPORT_EMAIL,
      availableLanguage: ["English"],
      // Intentionally omit `hoursAvailable` — no on-page copy on
      // /trust-center states business hours (per spec §10.1 honesty rule,
      // every structured-data claim must be provable from visible prose).
    },
    sameAs: ["https://github.com/Synov8/spire"],
  };
}

// ─── /integrations ────────────────────────────────────────────────────────

/**
 * ItemList — the 9 Spire integrations in canonical display order.
 * Each ListItem embeds a nested Service (full schema) so crawlers can
 * resolve to the per-integration /integrations/:slug page without an
 * extra hop.
 */
export function integrationsItemListSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Spire integrations",
    description:
      "Read-only integrations Spire uses to collect audit-ready evidence from your infrastructure.",
    numberOfItems: INTEGRATIONS.length,
    itemListElement: INTEGRATIONS.map((int, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Service",
        name: int.name,
        description: int.description,
        url: `${SITE_URL}/integrations/${int.slug}`,
        provider: { "@type": "Organization", name: "Spire", url: SITE_URL },
        serviceType: "Read-only API evidence collection",
        areaServed: "Global",
      },
    })),
  };
}

// ─── /integrations/:slug (bonus per-integration Service) ──────────────────

/**
 * Service — the per-integration page's structured data. Each Service
 * mirrors what's rendered visually and points back to the public URL.
 */
export function integrationServiceSchema(
  slug: string,
  name: string,
  description: string,
): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${name} integration for Spire`,
    description,
    url: `${SITE_URL}/integrations/${slug}`,
    provider: { "@type": "Organization", name: "Spire", url: SITE_URL },
    serviceType: "Read-only API evidence collection ",
    areaServed: "Global",
  };
}

// ─── HowTo (step-by-step guides) ──────────────────────────────────────────

/**
 * HowTo schema — for step-by-step guide blog posts. LLMs preferentially
 * cite structured HowTo content for procedural queries.
 */
export type HowToStep = { name: string; text: string; url?: string };

export function howToSchema(
  name: string,
  description: string,
  steps: HowToStep[],
  totalTime?: string,
): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url ? { url: s.url } : {}),
    })),
    ...(totalTime ? { totalTime } : {}),
  };
}

// ─── /blog/:slug (Article + optional per-post FAQPage) ───────────────────

/**
 * ArticleMeta — the metadata bag passed to `articleSchema()`. Mirrors the
 * legacy `GeoMeta` shape from the prior `app/components/geo-schema.tsx`
 * component consumed by `blog.$slug.tsx`.
 *
 * The `published`/`updated` values must already be ISO-8601 strings when
 * they reach the factory (the blog route converts `Date` objects via
 * `.toISOString?.()` before passing). This keeps timezone semantics
 * straightforward and matches how Google indexes the data.
 */
export type ArticleMeta = {
  title: string;
  description: string;
  published: string;
  updated?: string;
  author: string;
  tags: string[];
  slug: string;
  url: string;
  faq?: Array<{ question: string; answer: string }>;
};

/**
 * Article schema — for /blog/:slug pages. Replaces the legacy `ArticleSchema`
 * helper from `app/components/geo-schema.tsx`. Body is byte-identical to the
 * legacy output except that `publisher.url` references the canonical
 * `SITE_URL` constant instead of the hard-coded literal.
 */
export function articleSchema(meta: ArticleMeta): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.published,
    dateModified: meta.updated ?? meta.published,
    author: { "@type": "Person", name: meta.author },
    publisher: { "@type": "Organization", name: "Spire", url: SITE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": meta.url },
  };
}

/**
 * Per-post FAQPage schema. Distinct from `homeFaqPageSchema()` (which uses
 * the canonical FAQS constant and always emits 5 spec-ordered entries):
 * `faqPageSchema()` is data-driven from `Extract`'d `<h2 id="faq">` blocks
 * inside each post's markdown, so the number of questions varies per post.
 *
 * Returns `null` when the post has no FAQ block, mirroring the legacy
 * `FAQSchema` early-return. `StructuredData` recognises `null` and renders
 * nothing — callers do not need to add a guard around the `<StructuredData>`
 * call themselves.
 */
export function faqPageSchema(
  faq: ArticleMeta["faq"],
): Schema | null {
  if (!faq?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

// ─── /glossary (ItemList of DefinedTerm) ──────────────────────────────────

/**
 * GlossaryEntry — a single `<dt>`/`<dd>` pair from /glossary's `<dl>`.
 */
export type GlossaryEntry = { term: string; definition: string };

/**
 * ItemList of DefinedTerm entries — for /glossary. Replaces the inline
 * `<script type="application/ld+json">` block that previously lived at the
 * end of `app/routes/glossary.tsx`.
 *
 * Each `DefinedTerm` carries the term as `name` and the definition as
 * `description` so AI retrieval engines can cite them verbatim.
 */
export function definedTermItemListSchema(
  entries: GlossaryEntry[],
): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: entries.map((e, i) => ({
      "@type": "DefinedTerm",
      position: i + 1,
      name: e.term,
      description: e.definition,
    })),
  };
}
