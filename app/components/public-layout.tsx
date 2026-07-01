import { Link, useLocation } from "react-router";
import { useState, type ReactNode } from "react";
import { allPosts } from "content-collections";
import { INTEGRATION_NAMES } from "~/lib/integration-data";

const navLinks = [
  { to: "/features", label: "Features" },
  { to: "/integrations", label: "Integrations" },
  { to: "/pricing", label: "Pricing" },
  { to: "/trust-center", label: "Trust Center" },
  { to: "/blog", label: "Blog" },
];

function isActive(pathname: string, to: string) {
  if (to === "/blog") return pathname.startsWith("/blog");
  if (to === "/trust-center") return pathname === "/trust-center";
  if (to === "/integrations") return pathname === "/integrations";
  return pathname === to;
}

export function PublicNav() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <Link to="/" className="text-lg font-bold tracking-tight text-[#F1F1F3]">Spire</Link>

      <div className="hidden sm:flex items-center gap-8">
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

      <button onClick={() => setMenuOpen(true)} className="sm:hidden p-2 text-[#8B8B93] hover:text-[#F1F1F3] transition-colors" aria-label="Open menu">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0C] sm:hidden">
          <div className="flex items-center justify-between px-6 py-5">
            <span className="text-lg font-bold tracking-tight text-[#F1F1F3]">Spire</span>
            <button onClick={() => setMenuOpen(false)} className="p-2 text-[#8B8B93] hover:text-[#F1F1F3] transition-colors" aria-label="Close menu">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`text-xl transition-colors ${
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
              onClick={() => setMenuOpen(false)}
              className="mt-4 rounded-lg bg-[#00D4AA] px-8 py-3 text-lg font-medium text-black hover:bg-[#00B894] transition-colors"
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  const comparisons = allPosts.filter((p) => p.tags?.includes("Comparison")).slice(0, 5);

  return (
    <footer className="border-t border-[#1C1C24]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <span className="text-sm font-bold tracking-tight text-[#F1F1F3]">Spire</span>
            <p className="mt-2 text-xs text-[#5C5C66] leading-relaxed">AI-powered SOC&nbsp;2 and EU&nbsp;AI&nbsp;Act compliance automation for B2B SaaS.</p>
            <div className="mt-4 space-y-1.5">
              <Link to="/features" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Features</Link>
              <Link to="/integrations" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Integrations</Link>
              <Link to="/pricing" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Pricing</Link>
              <Link to="/trust-center" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Trust Center</Link>
              <Link to="/glossary" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Glossary</Link>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#5C5C66]">Integrations</span>
            <div className="mt-4 space-y-1.5">
              <Link to="/integrations/aws" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">AWS</Link>
              <Link to="/integrations/github" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">GitHub</Link>
              <Link to="/integrations/google-workspace" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Google Workspace</Link>
              <Link to="/integrations/stripe" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Stripe</Link>
              <Link to="/integrations/okta" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Okta</Link>
              <Link to="/integrations/datadog" className="block text-xs text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Datadog</Link>
              <Link to="/integrations" className="mt-2 block text-xs text-[#00D4AA] hover:text-[#00B894] transition-colors">Browse all {INTEGRATION_NAMES.length} →</Link>
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
        <div className="mt-10 border-t border-[#1C1C24] pt-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <a href="https://www.tinystartups.com/startup/spire" target="_blank" rel="noopener"
               style={{display:"inline-flex",alignItems:"center",gap:"14px",padding:"14px 22px 14px 18px",borderRadius:"14px",textDecoration:"none",fontFamily:"'Inter',system-ui,sans-serif",background:"linear-gradient(#0E0B1F,#0E0B1F) padding-box,linear-gradient(90deg,#3525E6,#D81FE0,#22B8F0) border-box",border:"2px solid transparent",color:"#fff"}}>
              <svg width="56" height="56" viewBox="0 0 100 100">
                <defs><linearGradient id="tsg" x1=".1" y1="0" x2=".9" y2="1"><stop offset="0%" stopColor="#3525E6"/><stop offset="55%" stopColor="#D81FE0"/><stop offset="100%" stopColor="#22B8F0"/></linearGradient></defs>
                <path d="M50 6C52 32 68 48 94 50C68 52 52 68 50 94C48 68 32 52 6 50C32 48 48 32 50 6Z" fill="url(#tsg)"/>
              </svg>
              <span style={{display:"flex",flexDirection:"column",lineHeight:"1.15"}}>
                <span style={{fontFamily:"monospace",fontSize:"9px",fontWeight:600,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.55)"}}>Launched on</span>
                <span style={{fontSize:"22px",fontWeight:800,letterSpacing:"-0.025em",color:"#fff"}}>Tiny Startups</span>
                <span style={{fontSize:"11px",color:"rgba(255,255,255,0.55)",marginTop:"4px"}}>tinystartups.com</span>
              </span>
            </a>
            <a href="https://www.producthunt.com/products/spire-6?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-spire-6" target="_blank" rel="noopener noreferrer">
              <img alt="Spire - AI-powered SOC 2 &amp; EU AI Act compliance | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1183433&theme=dark&t=1782720497497" /></a>
            <a href='https://www.sideprojectors.com/project/84002/spire' target="_blank" rel="noopener"><img src='https://www.sideprojectors.com/img/badges/badge_show_black.png' alt='Check out Spire at SideProjectors' /></a>
          </div>
          <p className="text-xs text-[#5C5C66]">
            &copy; {new Date().getFullYear()} Synov8 Ltd. &mdash; <a href="https://saascubes.com" rel="noopener" title="Listed on SaaS Cubes" className="hover:text-[#8B8B93] transition-colors">Listed on SaaS Cubes</a>
          </p>
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
