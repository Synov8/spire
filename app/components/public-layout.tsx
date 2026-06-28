import { Link, useLocation } from "react-router";
import type { ReactNode } from "react";

const navLinks = [
  { to: "/features", label: "Features" },
  { to: "/integrations", label: "Integrations" },
  { to: "/pricing", label: "Pricing" },
  { to: "/security", label: "Security" },
  { to: "/blog", label: "Blog" },
];

const footerLinks = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/faq", label: "FAQ" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
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
  const { pathname } = useLocation();
  return (
    <footer className="border-t border-[#1C1C24] py-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <span className="text-sm font-bold tracking-tight text-[#F1F1F3]">Spire</span>
        <div className="flex items-center gap-6 text-sm text-[#5C5C66]">
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`transition-colors ${
                isActive(pathname, link.to) ? "text-[#8B8B93]" : "hover:text-[#8B8B93]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <span>&copy; {new Date().getFullYear()} Synov8 Ltd.</span>
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
