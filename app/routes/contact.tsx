import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";

export function meta() {
	return [
		{ title: "Contact | Spire" },
		{
			name: "description",
			content:
				"Contact Spire's team about SOC 2 compliance automation, EU AI Act coverage, pricing, or enterprise sales.",
		},
		{ property: "og:title", content: "Contact | Spire" },
		{ property: "og:type", content: "website" },
	];
}

export default function ContactPage() {
	return (
		<PublicLayout>
			<section className="mx-auto max-w-6xl px-6 py-24">
				<div className="mx-auto max-w-3xl text-center">
					<h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
						Let's talk about
						<br />
						<span className="text-brand">your compliance goals</span>
					</h1>
					<p className="mt-4 text-lg text-text-secondary">
						Tell us about your stack and we'll show you what automated
						compliance looks like for your team.
					</p>
				</div>

				<div className="mt-14 grid gap-6 md:grid-cols-2">
					<div className="rounded-xl border border-border-primary bg-surface-secondary p-6">
						<h3 className="text-sm font-semibold text-text-primary">Email</h3>
						<p className="mt-1 text-sm text-text-secondary">
							hello@synov8studio.com
						</p>
					</div>
					<div className="rounded-xl border border-border-primary bg-surface-secondary p-6">
						<h3 className="text-sm font-semibold text-text-primary">
							Security questions
						</h3>
						<p className="mt-1 text-sm text-text-secondary">
							security@synov8studio.com
						</p>
					</div>
					<div className="rounded-xl border border-border-primary bg-surface-secondary p-6">
						<h3 className="text-sm font-semibold text-text-primary">
							Partnerships
						</h3>
						<p className="mt-1 text-sm text-text-secondary">
							partners@synov8studio.com
						</p>
					</div>
					<div className="rounded-xl border border-border-primary bg-surface-secondary p-6">
						<h3 className="text-sm font-semibold text-text-primary">
							Try it yourself
						</h3>
						<p className="mt-1 text-sm text-text-secondary">
							Connect your first integration in under 5 minutes.
						</p>
						<Link
							to="/login"
							className="mt-3 inline-flex h-11 items-center rounded-[20px] border border-border-primary px-6 text-sm font-medium text-text-secondary transition-all hover:border-brand/40 hover:text-text-primary hover:scale-[0.97] active:scale-[0.95]"
						>
							Get started
						</Link>
					</div>
				</div>
			</section>
		</PublicLayout>
	);
}
