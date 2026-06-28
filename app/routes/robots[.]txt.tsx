import { generateRobotsTxt } from "@forge42/seo-tools/robots";

export function loader({ request }: { request: Request }) {
  const domain = new URL(request.url).origin;
  const robotsTxt = generateRobotsTxt([
    {
      userAgent: "*",
      allow: ["/"],
      disallow: ["/dashboard", "/api", "/admin"],
      sitemap: [`${domain}/sitemap.xml`],
    },
    {
      userAgent: "GPTBot",
      disallow: ["/"],
    },
    {
      userAgent: "CCBot",
      disallow: ["/"],
    },
  ]);
  return new Response(robotsTxt, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
