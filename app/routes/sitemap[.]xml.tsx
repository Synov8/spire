import { generateSitemap, type SitemapRoute } from "@forge42/seo-tools/sitemap";
import { allPosts } from "content-collections";

export async function loader({ request }: { request: Request }) {
  const domain = new URL(request.url).origin;
  const posts = allPosts.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
  const routes: SitemapRoute[] = [
    { url: "/", changefreq: "monthly", priority: 1.0 },
    { url: "/features", changefreq: "monthly", priority: 0.8 },
    { url: "/pricing", changefreq: "weekly", priority: 0.9 },
    { url: "/security", changefreq: "monthly", priority: 0.8 },
    { url: "/glossary", changefreq: "monthly", priority: 0.7 },
    { url: "/blog", changefreq: "weekly", priority: 0.9 },
    { url: "/compare/vanta", changefreq: "monthly", priority: 0.7 },
    { url: "/compare/drata", changefreq: "monthly", priority: 0.7 },
    { url: "/compare/secureframe", changefreq: "monthly", priority: 0.7 },
    { url: "/compare/sprinto", changefreq: "monthly", priority: 0.7 },
    { url: "/compare/manual", changefreq: "monthly", priority: 0.7 },
    ...posts.map((p) => ({
      url: `/blog/${p.slug}`,
      changefreq: "monthly" as const,
      priority: 0.6 as const,
    })),
  ];
  const sitemap = await generateSitemap({ domain, routes, urlTransformer: (url: string) => url });
  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
