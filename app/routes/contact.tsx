import { Link } from "react-router";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-lg font-bold tracking-tight text-[#F1F1F3]">Spire</Link>
        <div className="flex items-center gap-8">
          <Link to="/features" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Features</Link>
          <Link to="/pricing" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">Pricing</Link>
          <Link to="/faq" className="text-sm text-[#8B8B93] hover:text-[#F1F1F3] transition-colors">FAQ</Link>
          <Link to="/login" className="rounded-lg border border-[#1C1C24] px-4 py-2 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors">Sign in</Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-20 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Contact</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">
            Let's talk about<br />
            <span className="text-[#00D4AA]">your compliance goals</span>
          </h1>
          <p className="mt-4 text-lg text-[#8B8B93]">
            Tell us about your stack and we'll show you what automated compliance looks like for your team.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-8">
            <h2 className="text-lg font-bold text-[#F1F1F3]">Book a demo</h2>
            <p className="mt-2 text-sm text-[#8B8B93]">See Spire working with your actual infrastructure. 15 minutes, no commitment.</p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-[#8B8B93]">Work email</label>
                <input type="email" required placeholder="you@company.com"
                  className="w-full rounded-lg border border-[#1C1C24] bg-[#0A0A0C] px-3 py-2.5 text-sm text-[#F1F1F3] placeholder-[#5C5C66] focus:border-[#00D4AA] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-[#8B8B93]">Company</label>
                <input type="text" required placeholder="Your company"
                  className="w-full rounded-lg border border-[#1C1C24] bg-[#0A0A0C] px-3 py-2.5 text-sm text-[#F1F1F3] placeholder-[#5C5C66] focus:border-[#00D4AA] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-[#8B8B93]">What are you working on?</label>
                <textarea rows={3} placeholder="Preparing for SOC 2, responding to enterprise security reviews..."
                  className="w-full rounded-lg border border-[#1C1C24] bg-[#0A0A0C] px-3 py-2.5 text-sm text-[#F1F1F3] placeholder-[#5C5C66] focus:border-[#00D4AA] focus:outline-none transition-colors resize-none" />
              </div>
              <button type="submit" className="w-full rounded-lg bg-[#00D4AA] py-2.5 text-sm font-medium text-black hover:bg-[#00B894] transition-colors">
                Book a 15-minute demo
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
              <h3 className="text-sm font-semibold text-[#F1F1F3]">Email</h3>
              <p className="mt-1 text-sm text-[#8B8B93]">hello@synov8studio.com</p>
            </div>
            <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
              <h3 className="text-sm font-semibold text-[#F1F1F3]">Security questions</h3>
              <p className="mt-1 text-sm text-[#8B8B93]">security@synov8studio.com</p>
            </div>
            <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
              <h3 className="text-sm font-semibold text-[#F1F1F3]">Partnerships</h3>
              <p className="mt-1 text-sm text-[#8B8B93]">partners@synov8studio.com</p>
            </div>
            <div className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
              <h3 className="text-sm font-semibold text-[#F1F1F3]">Try it yourself</h3>
              <p className="mt-1 text-sm text-[#8B8B93]">Connect your first integration in under 5 minutes.</p>
              <Link to="/login" className="mt-3 inline-block rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-colors">
                Get started free
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1C1C24] py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-bold tracking-tight text-[#F1F1F3]">Spire</span>
          <div className="flex items-center gap-6 text-sm text-[#5C5C66]">
            <Link to="/privacy" className="hover:text-[#8B8B93] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#8B8B93] transition-colors">Terms</Link>
            <span>© {new Date().getFullYear()} Synov8 Ltd.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
