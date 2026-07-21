import { Link, useLocation } from "react-router";
import { useState, useEffect, type ReactNode } from "react";
import { allPosts } from "content-collections";
import { INTEGRATION_NAMES } from "~/lib/integration-data";
import { authClient } from "~/lib/auth-client";
import { StructuredData } from "~/components/structured-data";
import { webSiteSchema } from "~/lib/structured-data";

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
  const [authed, setAuthed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    authClient.getSession().then((s: any) => setAuthed(!!s?.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-surface" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight text-text-primary"
        >
          Spire
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm transition-colors ${
                isActive(pathname, link.to)
                  ? "text-brand font-medium"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to={authed ? "/dashboard" : "/login"}
            className="inline-flex h-9 items-center rounded-[20px] bg-brand px-5 text-sm font-medium text-black transition-all hover:bg-brand-dark hover:scale-[0.97] active:scale-[0.95]"
          >
            {authed ? "Dashboard" : "Get started"}
          </Link>
        </nav>

        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 text-text-secondary hover:text-text-primary sm:hidden"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        {menuOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-surface-primary sm:hidden">
            <div className="flex h-16 items-center justify-between px-6">
              <span className="text-lg font-bold tracking-tight text-text-primary">
                Spire
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 text-text-secondary hover:text-text-primary"
                aria-label="Close menu"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
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
                      ? "text-brand font-medium"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to={authed ? "/dashboard" : "/login"}
                onClick={() => setMenuOpen(false)}
                className="mt-4 inline-flex h-11 items-center rounded-[20px] bg-brand px-8 text-lg font-medium text-black transition-all hover:bg-brand-dark active:scale-[0.97]"
              >
                {authed ? "Dashboard" : "Get started"}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export function PublicFooter() {
  const comparisons = allPosts
    .filter(
      (p) =>
        p.tags?.includes("Comparison") &&
        (p.slug.toLowerCase().includes("spire") ||
          p.title.toLowerCase().includes("spire")),
    )
    .slice(0, 5);

  const launchBadges = [
    { name: "Tiny Startups", href: "https://www.tinystartups.com/startup/spire" },
    { name: "Product Hunt", href: "https://www.producthunt.com/products/spire-6" },
    { name: "SideProjectors", href: "https://www.sideprojectors.com/project/84002/spire" },
    { name: "SaaS Cubes", href: "https://saascubes.com" },
    { name: "Startup Fame", href: "https://startupfa.me/s/spire" },
  ];

  return (
    <footer className="border-t border-border-primary">
      {/* Launch badges strip */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="relative overflow-hidden mask-fade-x">
          <div className="flex w-max animate-scroll items-center gap-6">
            {[...Array(2)].flatMap(() =>
              launchBadges.map((badge) => (
                <a
                  key={badge.name}
                  href={badge.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 shrink-0 items-center rounded-full border border-border-primary bg-surface-secondary px-4 text-xs font-medium text-text-tertiary transition-colors hover:border-brand/30 hover:text-text-primary"
                >
                  {badge.name}
                </a>
              )),
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <span className="text-sm font-bold tracking-tight text-text-primary">
              Spire
            </span>
            <p className="mt-2 text-xs leading-relaxed text-text-tertiary">
              AI-powered SOC&nbsp;2 and EU&nbsp;AI&nbsp;Act compliance
              automation for B2B SaaS.
            </p>
            <div className="mt-4 space-y-1.5">
              <Link to="/features" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Features</Link>
              <Link to="/integrations" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Integrations</Link>
              <Link to="/pricing" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Pricing</Link>
              <Link to="/trust-center" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Trust Center</Link>
              <Link to="/glossary" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Glossary</Link>
            </div>
          </div>

          {/* Integrations */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary">Integrations</span>
            <div className="mt-4 space-y-1.5">
              <Link to="/integrations/aws" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">AWS</Link>
              <Link to="/integrations/github" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">GitHub</Link>
              <Link to="/integrations/stripe" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Stripe</Link>
              <Link to="/integrations/okta" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Okta</Link>
              <Link to="/integrations/datadog" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Datadog</Link>
              <Link to="/integrations" className="mt-2 block text-xs text-brand hover:text-brand-dark transition-colors">
                Browse all {INTEGRATION_NAMES.length} &rarr;
              </Link>
            </div>
          </div>

          {/* Guides */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary">Guides</span>
            <div className="mt-4 space-y-1.5">
              <Link to="/blog/soc2-compliance-automation-guide-2026" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">SOC 2 automation guide</Link>
              <Link to="/blog/eu-ai-act-compliance-checklist-us-saas-2026" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">EU AI Act checklist</Link>
              <Link to="/blog/soc2-cost-breakdown-startups-2026" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">SOC 2 cost breakdown</Link>
              <Link to="/blog/soc2-vs-iso27001-comparison-which-first" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">SOC 2 vs ISO 27001</Link>
              <Link to="/blog/automated-evidence-collection-soc2-guide" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Evidence collection guide</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary">Company</span>
            <div className="mt-4 space-y-1.5">
              <Link to="/blog" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Blog</Link>
              <Link to="/faq" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">FAQ</Link>
              <Link to="/contact" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Contact</Link>
              <Link to="/privacy" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Terms</Link>
              <Link to="/ai" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">AI</Link>
              <Link to="/health" className="block text-xs text-text-secondary hover:text-text-primary transition-colors">Status</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border-primary pt-6">
          <p className="text-xs text-text-tertiary">
            &copy; {new Date().getFullYear()} Synov8 Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-primary pt-16">
      <StructuredData schemas={[webSiteSchema()]} />
      <PublicNav />
      {children}
      <PublicFooter />
    </div>
  );
}
