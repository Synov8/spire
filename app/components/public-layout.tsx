import { Link, useLocation } from "react-router";
import type { ReactNode } from "react";
import { allPosts } from "content-collections";

const navLinks = [
  { to: "/features", label: "Features" },
  { to: "/integrations", label: "Integrations" },
  { to: "/pricing", label: "Pricing" },
  { to: "/security", label: "Security" },
  { to: "/blog", label: "Blog" },
];

function isActive(pathname: string, to: string) {
  if (to === "/blog") return pathname.startsWith("/blog");
  if (to === "/security") return pathname === "/security";
  if (to === "/integrations") return pathname === "/integrations";
  return pathname === to;
}

export function PublicNav() {
  const { pathname } = useLocation();
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <Link to="/" className="text-lg font-bold tracking-tight text-[#F1F1F3]">Spire</Link>
      <div className="flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-sm transition-colors ${
              isActive(pathname, link.to)
                ? "text-[#00D4AA]"
                : "text-[#8B8B93] hover:text-[#F1F1F3]"
            }`}
          >
            {link.label}
          </Link>
        ))}
        <Link
          to="/login"
          className="rounded-lg border border-[#1C1C24] px-4 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}

export function PublicFooter() {
  const comparisons = allPosts.filter((p) => p.tags?.includes("Comparison")).slice(0, 5);

  return (
    <footer className="border-t border-[#1C1C24]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <span className="text-sm font-bold tracking-tight text-[#F1F1F3]">Spire</span>
            <p className="mt-2 text-xs text-[#5C5C66] leading-relaxed">AI-powered SOC&nbsp;2 and EU&nbsp;AI&nbsp;Act compliance automation for B2B SaaS.</p>
            <div className="mt-4 space-y-1.5">
              <Link to="/features" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Features</Link>
              <Link to="/integrations" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Integrations</Link>
              <Link to="/pricing" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Pricing</Link>
              <Link to="/security" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Security</Link>
              <Link to="/glossary" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Glossary</Link>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#5C5C66]">Guides</span>
            <div className="mt-4 space-y-1.5">
              <Link to="/blog/soc2-compliance-automation-guide-2026" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">SOC 2 automation guide</Link>
              <Link to="/blog/eu-ai-act-compliance-checklist-us-saas-2026" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">EU AI Act checklist</Link>
              <Link to="/blog/soc2-cost-breakdown-startups-2026" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">SOC 2 cost breakdown</Link>
              <Link to="/blog/soc2-vs-iso27001-comparison-which-first" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">SOC 2 vs ISO 27001</Link>
              <Link to="/blog/automated-evidence-collection-soc2-guide" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Evidence collection guide</Link>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#5C5C66]">Compare</span>
            <div className="mt-4 space-y-1.5">
              {comparisons.map((p) => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors truncate">
                  {(() => {
                    const name = p.title.replace(/^Spire vs /, "").replace(/:.*$/, "");
                    return `vs ${name}`;
                  })()}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#5C5C66]">Company</span>
            <div className="mt-4 space-y-1.5">
              <Link to="/blog" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Blog</Link>
              <Link to="/faq" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">FAQ</Link>
              <Link to="/contact" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Contact</Link>
              <Link to="/privacy" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Privacy</Link>
              <Link to="/terms" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Terms</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-[#1C1C24] pt-6 text-center text-xs text-[#5C5C66]">
          &copy; {new Date().getFullYear()} Synov8 Ltd.
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <PublicNav />
      {children}
      <PublicFooter />
    </div>
  );
}
