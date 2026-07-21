import { Link, useFetcher } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { Resend } from "resend";

export function meta() {
  return [
    { title: "Contact | Spire" },
    { name: "description", content: "Contact Spire's team about SOC 2 compliance automation, EU AI Act coverage, pricing, or enterprise sales." },
    { property: "og:title", content: "Contact | Spire" },
    { property: "og:type", content: "website" },
  ];
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const company = formData.get("company") as string;
  const message = formData.get("message") as string;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Email service not configured" };
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Spire Contact <noreply@synov8studio.com>",
    to: "hello@synov8studio.com",
    replyTo: email,
    subject: `New demo request from ${company}`,
    html: `<p><strong>Email:</strong> ${email}</p><p><strong>Company:</strong> ${company}</p><p><strong>Message:</strong></p><p>${message}</p>`,
  });

  if (error) {
    console.error("contact form error", error);
    return { ok: false, error: "Failed to send message" };
  }

  return { ok: true };
}

export default function ContactPage() {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();

  return (
    <PublicLayout>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
            Let's talk about<br />
            <span className="text-brand">your compliance goals</span>
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            Tell us about your stack and we'll show you what automated compliance looks like for your team.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-border-primary bg-surface-secondary p-8">
            <h2 className="text-lg font-bold text-text-primary">Book a demo</h2>
            <p className="mt-2 text-sm text-text-secondary">See Spire working with your actual infrastructure. 15 minutes, no commitment.</p>
            {fetcher.data?.ok ? (
              <p className="mt-6 text-sm text-brand">Thanks! We'll be in touch shortly.</p>
            ) : (
              <fetcher.Form method="post" className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-text-secondary">Work email</label>
                  <input type="email" name="email" required placeholder="you@company.com"
                    className="w-full rounded-[8px] border border-border-primary bg-surface-primary px-3 py-2.5 text-sm text-text-primary placeholder-text-text-tertiary focus:border-brand focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-text-secondary">Company</label>
                  <input type="text" name="company" required placeholder="Your company"
                    className="w-full rounded-[8px] border border-border-primary bg-surface-primary px-3 py-2.5 text-sm text-text-primary placeholder-text-text-tertiary focus:border-brand focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-text-secondary">What are you working on?</label>
                  <textarea name="message" rows={3} required placeholder="Preparing for SOC 2, responding to enterprise security reviews..."
                    className="w-full rounded-[8px] border border-border-primary bg-surface-primary px-3 py-2.5 text-sm text-text-primary placeholder-text-text-tertiary focus:border-brand focus:outline-none transition-colors resize-none" />
                </div>
                {fetcher.data?.error && (
                  <p className="text-sm text-error">{fetcher.data.error}</p>
                )}
                <button type="submit" disabled={fetcher.state !== "idle"} className="flex h-11 w-full items-center justify-center rounded-[20px] bg-brand px-6 text-sm font-semibold text-black transition-all hover:bg-brand-dark hover:scale-[0.97] active:scale-[0.95] disabled:opacity-50">
                  {fetcher.state !== "idle" ? "Sending..." : "Book a 15-minute demo"}
                </button>
              </fetcher.Form>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border-primary bg-surface-secondary p-6">
              <h3 className="text-sm font-semibold text-text-primary">Email</h3>
              <p className="mt-1 text-sm text-text-secondary">hello@synov8studio.com</p>
            </div>
            <div className="rounded-xl border border-border-primary bg-surface-secondary p-6">
              <h3 className="text-sm font-semibold text-text-primary">Security questions</h3>
              <p className="mt-1 text-sm text-text-secondary">security@synov8studio.com</p>
            </div>
            <div className="rounded-xl border border-border-primary bg-surface-secondary p-6">
              <h3 className="text-sm font-semibold text-text-primary">Partnerships</h3>
              <p className="mt-1 text-sm text-text-secondary">partners@synov8studio.com</p>
            </div>
            <div className="rounded-xl border border-border-primary bg-surface-secondary p-6">
              <h3 className="text-sm font-semibold text-text-primary">Try it yourself</h3>
              <p className="mt-1 text-sm text-text-secondary">Connect your first integration in under 5 minutes.</p>
              <Link to="/login" className="mt-3 inline-flex h-11 items-center rounded-[20px] border border-border-primary px-6 text-sm font-medium text-text-secondary transition-all hover:border-brand/40 hover:text-text-primary hover:scale-[0.97] active:scale-[0.95]">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
