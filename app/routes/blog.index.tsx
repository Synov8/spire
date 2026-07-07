import { Link, useSearchParams } from "react-router";
import { allPosts } from "content-collections";
import { PublicLayout } from "~/components/public-layout";
import { StructuredData } from "~/components/structured-data";
import { organizationSchema } from "~/lib/structured-data";

const PER_PAGE = 6;

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
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const posts = allPosts.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
  const featured = posts[0];
  const restAll = posts.slice(1);
  const totalPages = Math.ceil(restAll.length / PER_PAGE);
  const rest = restAll.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <PublicLayout>
      <StructuredData schemas={organizationSchema()} />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 sm:pt-20 pb-24">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Blog</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">Compliance, engineering, and the AI Act</h1>
          <p className="mx-auto mt-4 max-w-xl text-[#8B8B93]">Practical guides for B2B SaaS teams navigating SOC 2, the EU AI Act, and security reviews.</p>
        </div>

        {featured && (
          <Link to={`/blog/${featured.slug}`} className="group mt-14 flex flex-col gap-5 rounded-xl border border-[#1C1C24] bg-gradient-to-br from-[#15151C] to-[#111116] p-8 hover:border-[#00D4AA]/30 transition-colors md:flex-row md:items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-xs text-[#5C5C66]">
                <time>{new Date(featured.published).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>
                <span className="rounded bg-[#00D4AA]/10 px-2 py-0.5 text-[#00D4AA]">Latest</span>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-[#F1F1F3] group-hover:text-[#00D4AA] transition-colors">{featured.title}</h2>
              <p className="mt-3 text-sm text-[#8B8B93] leading-relaxed">{featured.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {featured.tags?.slice(0, 3).map((t) => <span key={t} className="rounded bg-[#1C1C24] px-2.5 py-0.5 text-xs text-[#8B8B93]">{t}</span>)}
              </div>
            </div>
            <div className="hidden shrink-0 self-center md:block">
              <span className="text-sm text-[#00D4AA] group-hover:translate-x-1 transition-transform inline-block">Read more &rarr;</span>
            </div>
          </Link>
        )}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group flex flex-col rounded-xl border border-[#1C1C24] bg-[#111116] p-6 hover:border-[#00D4AA]/20 hover:bg-[#16161D] transition-colors">
              <div className="flex items-center gap-2 text-xs text-[#5C5C66]">
                <time>{new Date(post.published).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time>
              </div>
              <h2 className="mt-3 font-bold text-[#F1F1F3] leading-snug group-hover:text-[#00D4AA] transition-colors">{post.title}</h2>
              <p className="mt-2 text-xs text-[#8B8B93] leading-relaxed line-clamp-3">{post.description}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                {post.tags?.slice(0, 2).map((t) => <span key={t} className="rounded bg-[#1C1C24] px-2 py-0.5 text-[10px] text-[#8B8B93]">{t}</span>)}
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setSearchParams({ page: String(page - 1) })}
              className="rounded-lg border border-[#1C1C24] px-3 py-2 text-sm text-[#8B8B93] hover:border-[#00D4AA]/30 hover:text-[#F1F1F3] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >Previous</button>

            {(() => {
              const pages: (number | "...")[] = [];
              const range = 1;
              for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= page - range && i <= page + range)) {
                  pages.push(i);
                } else if (pages[pages.length - 1] !== "...") {
                  pages.push("...");
                }
              }
              return pages.map((n) =>
                n === "..." ? (
                  <span key="e" className="px-1 text-sm text-[#5C5C66]">&hellip;</span>
                ) : (
                  <button key={n} onClick={() => setSearchParams({ page: String(n) })}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors ${n === page ? "bg-[#00D4AA]/10 text-[#00D4AA]" : "text-[#5C5C66] hover:text-[#F1F1F3]"}`}
                  >{n}</button>
                )
              );
            })()}

            <button
              disabled={page >= totalPages}
              onClick={() => setSearchParams({ page: String(page + 1) })}
              className="rounded-lg border border-[#1C1C24] px-3 py-2 text-sm text-[#8B8B93] hover:border-[#00D4AA]/30 hover:text-[#F1F1F3] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >Next</button>
          </div>
        )}
      </section>

    </PublicLayout>
  );
}
