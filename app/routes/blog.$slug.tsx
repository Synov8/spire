import { Link, useParams } from "react-router";
import { allPosts } from "content-collections";
import { PublicLayout } from "~/components/public-layout";
import { StructuredData } from "~/components/structured-data";
import {
  articleSchema,
  faqPageSchema,
  organizationSchema,
  breadcrumbListSchema,
} from "~/lib/structured-data";

export function meta({ params }: { params: { slug: string } }) {
  const post = allPosts.find((p) => p.slug === params.slug);
  if (!post) return [{ title: "Post Not Found | Spire" }];
  return [
    { title: `${post.title} | Spire` },
    { name: "description", content: post.description },
    { property: "og:title", content: `${post.title} | Spire` },
    { property: "og:description", content: post.description },
    { property: "og:url", content: `https://spire.synov8studio.com/blog/${post.slug}` },
    { property: "og:type", content: "article" },
    { property: "article:published_time", content: post.published.toISOString?.() ?? post.published },
    ...(post.tags?.map((t: string) => ({ property: "article:tag", content: t })) ?? []),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: post.title },
    { name: "twitter:description", content: post.description },
  ];
}

function extractFaq(html: string) {
  const faqH2 = '<h2 id="faq">FAQ</h2>';
  const idx = html.indexOf(faqH2);
  if (idx === -1) return undefined;
  const afterFaq = html.slice(idx + faqH2.length);
  const faq: Array<{ question: string; answer: string }> = [];
  const h3Re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = h3Re.exec(afterFaq)) !== null) {
    const question = m[1].replace(/<[^>]+>/g, "").trim();
    const answer = m[2].replace(/<[^>]+>/g, "").trim();
    if (question && answer) faq.push({ question, answer });
  }
  return faq.length > 0 ? faq : undefined;
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = allPosts.find((p) => p.slug === slug);

  if (!post) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0C]">
      <div className="text-center"><p className="text-[#8B8B93]">Post not found.</p><Link to="/blog" className="mt-4 inline-block text-[#00D4AA]">Back to blog</Link></div>
    </div>
  );

  const url = `https://spire.synov8studio.com/blog/${post.slug}`;

  const faqItems = extractFaq(post.html);

  return (
    <PublicLayout>
      <StructuredData
        schemas={articleSchema({
          title: post.title,
          description: post.description,
          published: post.published.toISOString?.() ?? post.published,
          updated: post.updated?.toISOString?.(),
          author: post.author,
          tags: post.tags,
          slug: post.slug,
          url,
        })}
      />
      <StructuredData schemas={faqPageSchema(faqItems)} />
      <StructuredData schemas={organizationSchema()} />
      <StructuredData schemas={breadcrumbListSchema([
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
        { name: post.title, url: `/blog/${post.slug}` },
      ])} />

      <article className="mx-auto max-w-6xl px-6 pt-16 pb-24">
        <Link to="/blog" className="text-sm text-[#8B8B93] hover:text-[#00D4AA] transition-colors">&larr; Back to blog</Link>
        <div className="mt-8 flex items-center gap-3 text-xs text-[#5C5C66]">
          <time>{new Date(post.published).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>
          <span>·</span>
          <span>{post.author}</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl leading-[1.1]">{post.title}</h1>
        <p className="mt-4 text-lg text-[#8B8B93] leading-relaxed">{post.description}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((t) => <span key={t} className="rounded bg-[#1C1C24] px-2.5 py-1 text-xs text-[#8B8B93]">{t}</span>)}
          </div>
        )}
        <div className="mt-12 max-w-5xl prose prose-invert prose-lg prose-a:text-[#00D4AA] prose-code:text-[#00D4AA] prose-strong:text-[#F1F1F3] prose-headings:text-[#F1F1F3] prose-p:text-[#B0B0B8] prose-li:text-[#B0B0B8] prose-hr:border-[#1C1C24] prose-td:text-[#B0B0B8] prose-th:text-[#F1F1F3]" dangerouslySetInnerHTML={{ __html: post.html }} />

        {(() => {
          const related = allPosts.filter((p) => p.slug !== slug && p.tags?.some((t) => post.tags?.includes(t))).slice(0, 3);
          if (related.length === 0) return null;
          return (
            <section className="mx-auto mt-16 max-w-6xl border-t border-[#1C1C24] pt-12">
              <h2 className="text-lg font-bold text-[#F1F1F3]">Related posts</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((rp) => (
                  <Link key={rp.slug} to={`/blog/${rp.slug}`} className="group rounded-xl border border-[#1C1C24] bg-[#111116] p-5 hover:border-[#00D4AA]/20 hover:bg-[#16161D] transition-all">
                    <div className="flex items-center gap-2 text-xs text-[#5C5C66]">
                      <time>{new Date(rp.published).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time>
                    </div>
                    <h3 className="mt-2 font-medium text-[#F1F1F3] group-hover:text-[#00D4AA] transition-colors">{rp.title}</h3>
                    <p className="mt-1 text-xs text-[#8B8B93] line-clamp-2">{rp.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })()}
      </article>

    </PublicLayout>
  );
}
