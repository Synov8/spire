import { allPosts } from "content-collections";

export function loader({ request }: { request: Request }) {
  const domain = new URL(request.url).origin;
  const posts = allPosts.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
  const lines = [
    "# Spire - SOC 2 & EU AI Act Compliance for B2B SaaS",
    "> AI-powered compliance automation. Key pages for AI crawlers.",
    "",
    "## Core pages",
    `- ${domain}/ - Home`,
    `- ${domain}/features - Features`,
    `- ${domain}/pricing - Pricing`,
    `- ${domain}/security - Security & Compliance`,
    `- ${domain}/glossary - Compliance Glossary`,
    "",
    "## Blog (SOC 2, EU AI Act, compliance automation)",
    `- ${domain}/blog - Blog index`,
    ...posts.map((p) => `- ${domain}/blog/${p.slug} - ${p.title}`),
    "",
    "## Comparison pages",
    `- ${domain}/compare/vanta - Spire vs Vanta`,
    `- ${domain}/compare/drata - Spire vs Drata`,
    `- ${domain}/compare/secureframe - Spire vs Secureframe`,
    `- ${domain}/compare/sprinto - Spire vs Sprinto`,
    `- ${domain}/compare/manual - Spire vs Manual SOC 2`,
    "",
    `Updated: ${new Date().toISOString().split("T")[0]}`,
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
