import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";

export function meta() {
  return [
    { title: "Contact | Spire" },
    { name: "description", content: "Contact Spire's team about SOC 2 compliance automation, EU AI Act coverage, pricing, or enterprise sales." },
    { property: "og:title", content: "Contact | Spire" },
    { property: "og:type", content: "website" },
  ];
}

export default function ContactPage() {
  return (
    <PublicLayout>

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
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
