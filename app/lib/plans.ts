import process from "node:process";

export interface Plan {
  name: string;
  slug: string;
  monthly: number;
  annual: number;
  desc: string;
  features: string[];
  popular?: boolean;
  cta: string;
  href: string;
  limits: { integrations: number; questionnaires: number };
}

export const plans: Plan[] = [
  { name: "Starter", slug: "starter", monthly: 200, annual: 2000, cta: "Start free trial", href: "/login",
    desc: "For seed-stage SaaS companies getting started with SOC 2.",
    features: ["Up to 3 connected integrations", "Up to 5 questionnaire auto-fills per month", "Email support"],
    limits: { integrations: 3, questionnaires: 5 } },
  { name: "Growth", slug: "growth", monthly: 1200, annual: 12000, popular: true, cta: "Start free trial", href: "/login",
    desc: "For Series A–C SaaS teams closing enterprise deals.",
    features: ["Up to 10 connected integrations", "Unlimited questionnaire auto-fills", "Team member invitations", "Priority support"],
    limits: { integrations: 10, questionnaires: -1 } },
  { name: "Enterprise", slug: "enterprise", monthly: 3000, annual: 30000, cta: "Book a demo", href: "/contact",
    desc: "For companies needing custom compliance workflows.",
    features: ["Unlimited integrations", "Unlimited questionnaire auto-fills", "Custom onboarding & dedicated support"],
    limits: { integrations: -1, questionnaires: -1 } },
];

export function stripePlan(p: Plan) {
  const env = process.env;
  const suffix = p.slug === "enterprise" ? "ENTERPRISE" : p.slug.toUpperCase();
  return {
    name: p.slug,
    priceId: env[`STRIPE_${suffix}_PRICE_ID` as keyof typeof env] as string || `price_${p.slug}`,
    annualDiscountPriceId: env[`STRIPE_${suffix}_ANNUAL_PRICE_ID` as keyof typeof env] as string || undefined,
    limits: p.limits,
  };
}
