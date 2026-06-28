import { Link } from "react-router";
import { allPosts } from "content-collections";
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
    <div className="min-h-screen bg-[#0A0A0C]">
      <OrganizationSchema />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-lg font-bold tracking-tight text-[#F1F1F3]">Spire</Link>
        <div className="flex items-center gap-8">
          <Link to="/features" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Features</Link>
          <Link to="/pricing" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Pricing</Link>
          <Link to="/blog" className="text-sm text-[#00D4AA] transition-colors">Blog</Link>
          <Link to="/login" className="rounded-lg border border-[#1C1C24] px-4 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors">Sign in</Link>
        </div>
      </header>

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

      <footer className="border-t border-[#1C1C24] py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-bold tracking-tight text-[#F1F1F3]">Spire</span>
          <div className="flex items-center gap-6 text-sm text-[#5C5C66]">
            <Link to="/blog" className="hover:text-[#8B8B93] transition-colors">Blog</Link>
            <Link to="/privacy" className="hover:text-[#8B8B93] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#8B8B93] transition-colors">Terms</Link>
            <span>© {new Date().getFullYear()} Synov8 Ltd.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
