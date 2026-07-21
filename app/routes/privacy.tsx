import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";

export function meta() {
  return [
    { title: "Privacy Policy | Spire" },
    { name: "description", content: "Spire's privacy policy covering data collection, data processing, subprocessor management, and customer data protection for our SOC 2 and EU AI Act compliance platform." },
    { property: "og:title", content: "Privacy Policy | Spire" },
    { property: "og:type", content: "website" },
  ];
}

const sections = [
  { title: "Information we collect", content: "When you sign up for Spire, we collect your name, email address, and company name. When you connect integrations, we collect read-only data from those systems including configuration metadata, access logs, and activity records. We do not collect sensitive personal data, passwords, or private keys." },
  { title: "How we use your information", content: "We use your information to operate the Spire service: collect and store compliance evidence, generate compliance mappings, auto-fill questionnaires, and provide you access to your compliance dashboard. We do not sell your data or use it for advertising." },
  { title: "Data storage and security", content: "Evidence data is encrypted at rest (AES-256) and in transit (TLS 1.3). We maintain separate data stores per customer. You can request data export or deletion at any time. Access tokens are encrypted before storage." },
  { title: "Data retention", content: "We retain your evidence data for as long as your account is active. Upon account cancellation, data is deleted within 30 days unless legal obligations require longer retention. You can request immediate deletion at any time." },
  { title: "Third-party subprocessors", content: "We use Neon (PostgreSQL database), Cloudflare (CDN and edge compute), and OpenAI (questionnaire processing) as subprocessors. All subprocessors are contractually bound to the same data protection standards." },
  { title: "Your rights", content: "You have the right to access, correct, export, and delete your data. You can manage integrations, revoke access tokens, and export evidence from your dashboard at any time. For any data request, contact privacy@synov8studio.com." },
  { title: "Changes to this policy", content: "We will notify you of material changes to this policy via email or in-app notification. Continued use of the service after changes constitutes acceptance of the updated policy." },
];

export default function PrivacyPage() {
  return (
    <PublicLayout>

      <section className="mx-auto max-w-3xl px-6 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">Privacy policy</h1>
          <p className="mt-3 text-sm text-text-tertiary">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>

        <div className="mt-14 space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-text-primary">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-border-primary bg-surface-secondary p-6">
          <p className="text-sm text-text-secondary">
            Questions about this policy? Contact <span className="text-brand">privacy@synov8studio.com</span>
          </p>
        </div>
      </section>

    </PublicLayout>
  );
}
