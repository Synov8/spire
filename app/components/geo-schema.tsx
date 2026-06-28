import type { Post } from "content-collections";

interface GeoMeta {
  title: string;
  description: string;
  published: string;
  updated?: string;
  author: string;
  tags: string[];
  slug: string;
  url: string;
  faq?: Array<{ question: string; answer: string }>;
}

export function ArticleSchema({ meta }: { meta: GeoMeta }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.published,
    dateModified: meta.updated ?? meta.published,
    author: { "@type": "Person", name: meta.author },
    publisher: { "@type": "Organization", name: "Spire", url: "https://spire.synov8studio.com" },
    mainEntityOfPage: { "@type": "WebPage", "@id": meta.url },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function FAQSchema({ faq }: { faq: GeoMeta["faq"] }) {
  if (!faq?.length) return null;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Spire",
    url: "https://spire.synov8studio.com",
    description: "AI-powered SOC 2 and EU AI Act compliance automation platform for B2B SaaS companies.",
    sameAs: ["https://github.com/Synov8/spire"],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
