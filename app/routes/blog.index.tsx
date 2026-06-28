import { Link } from "react-router";
import { allPosts } from "content-collections";
import { PublicLayout } from "~/components/public-layout";
import { OrganizationSchema } from "~/components/geo-schema";

export function meta() {
  return [
    { title: "Blog | Spire — SOC 2 & EU AI Act Compliance Guides for B2B SaaS" },
    { name: "description", content: "Practical guides for B2B SaaS teams navigating SOC 2 compliance automation, the EU AI Act, security questionnaires, and enterprise procurement requirements." },
    { property: "og:title", content: "Blog | Spire" },
    { property: "og:description", content: "Practical compliance guides for B2B SaaS teams." },
    { property: "og:url", content: "https://spire.synov8studio.com/blog" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export default function BlogIndex() {
  const posts = allPosts.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

  return (
    <PublicLayout>
      <OrganizationSchema />

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-24">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Blog</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">Compliance, engineering, and the AI Act</h1>
          <p className="mx-auto mt-4 max-w-xl text-[#8B8B93]">Practical guides for B2B SaaS teams navigating SOC 2, the EU AI Act, and security reviews.</p>
        </div>

        <div className="mt-14 space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="block rounded-xl border border-[#1C1C24] bg-[#111116] p-6 hover:border-[#00D4AA]/30 transition-colors">
              <div className="flex items-center gap-3 text-xs text-[#5C5C66]">
                <time>{new Date(post.published).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>
                {post.tags?.map((t) => <span key={t} className="rounded bg-[#1C1C24] px-2 py-0.5 text-[#8B8B93]">{t}</span>)}
              </div>
              <h2 className="mt-3 text-xl font-bold text-[#F1F1F3]">{post.title}</h2>
              <p className="mt-2 text-sm text-[#8B8B93]">{post.description}</p>
              <p className="mt-3 text-xs text-[#5C5C66]">{post.author}</p>
            </Link>
          ))}
        </div>
      </section>

    </PublicLayout>
  );
}
