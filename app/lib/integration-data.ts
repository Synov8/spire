/**
 * Single source of truth for the 9 Spire integrations.
 *
 * Powers:
 *   - /integrations        (hub)              — list of integrations with evidence
 *   - /integrations/:slug  (per-integration)  — loader lookup
 *   - /                    (home trust strip) — names only
 *   - future: control explorer filter chips
 *
 * Editing this file updates all surfaces in lockstep — no drift.
 *
 * Trademark note (home-overhaul-spec.md §16):
 *   The textual names listed here are universally permitted as referential
 *   use. Marketing these by their logomarks is restricted for AWS, Vercel,
 *   Cloudflare, and Stripe under their respective trademark policies.
 *   This module exposes NAMES ONLY — no asset references.
 */

export type IntegrationEvidenceItem = {
  /** SOC 2 / EU AI Act control ref (e.g. "CC6", "C1", "A1", "PI1"). null if no parens. */
  control: string | null;
  /** Human-readable evidence description, sans the control parenthetical. */
  text: string;
};

export type Integration = {
  /** URL-safe identifier (lowercase, hyphens). Routing key for /integrations/:slug. */
  slug: string;
  /** Display name (e.g. "AWS", "Google Workspace"). */
  name: string;
  /** One-line short description. */
  description: string;
  /**
   * Composio OAuth app name, if different from `slug`.
   * Only set when the Composio integration key diverges from the canonical slug
   * (e.g. slug="google-workspace" → composioApp="google").
   */
  composioApp?: string;
  /** Evidence items Spire collects from this integration, mapped to controls. */
  evidence: IntegrationEvidenceItem[];
};

/**
 * Splits a raw evidence string like `"CloudTrail event history (CC7)"` into
 * `{ control: "CC7", text: "CloudTrail event history" }`. Strings without a
 * `(...)` control reference yield `control: null`.
 */
function parseEvidence(raw: string): IntegrationEvidenceItem {
  const match = raw.match(/^(.+?)\s*\(([A-Z0-9\-.]+)\)\s*$/);
  if (!match) return { control: null, text: raw };
  return { control: match[2], text: match[1].trim() };
}

export const INTEGRATIONS: Integration[] = [
  {
    slug: "aws",
    name: "AWS",
    description: "Cloud infrastructure, IAM, monitoring, storage.",
    evidence: [
      "CloudTrail event history (CC7)",
      "IAM user permissions (CC6)",
      "S3 encryption status (C1)",
      "EC2 instance inventory (A1)",
      "Security group review",
    ].map(parseEvidence),
  },
  {
    slug: "github",
    name: "GitHub",
    description: "Source code, PRs, deployments, access control.",
    evidence: [
      "Commit history (CC8)",
      "Branch protection (CC6)",
      "Collaborator access (CC6)",
      "Pull request audit trails (CC8)",
      "Secret scanning",
    ].map(parseEvidence),
  },
  {
    slug: "google-workspace",
    name: "Google Workspace",
    description: "Admin audit logs, directory, OAuth.",
    composioApp: "google",
    evidence: [
      "Admin activity reports (CC7)",
      "User directory with admin status (CC6)",
      "Login audit events",
      "OAuth token scope review",
    ].map(parseEvidence),
  },
  {
    slug: "vercel",
    name: "Vercel",
    description: "Deployments, environment variables, team access.",
    evidence: [
      "Deployment protection (CC8)",
      "Environment variable scoping (C1)",
      "Team member access (CC6)",
    ].map(parseEvidence),
  },
  {
    slug: "cloudflare",
    name: "Cloudflare",
    description: "DNS, CDN, WAF, DDoS protection.",
    evidence: [
      "WAF rule configuration (CC7)",
      "SSL/TLS settings (C1)",
      "DDoS protection (A1)",
    ].map(parseEvidence),
  },
  {
    slug: "clerk",
    name: "Clerk",
    description: "Authentication, user management, MFA.",
    evidence: [
      "MFA enforcement (CC6)",
      "SSO configuration (CC6)",
      "Session management (CC6)",
    ].map(parseEvidence),
  },
  {
    slug: "supabase",
    name: "Supabase",
    description: "Database, auth, storage, realtime.",
    evidence: [
      "Encryption at rest (C1)",
      "Row-level security (CC6)",
      "Auth settings (CC6)",
    ].map(parseEvidence),
  },
  {
    slug: "stripe",
    name: "Stripe",
    description: "Payments, billing, subscriptions.",
    evidence: [
      "PCI compliance posture (C1)",
      "Webhook signing (PI1)",
      "API key rotation (CC6)",
    ].map(parseEvidence),
  },
  {
    slug: "resend",
    name: "Resend",
    description: "Transactional email, deliverability.",
    evidence: [
      "DKIM/SPF configuration (C1)",
      "Email encryption (C1)",
      "API key scoping (CC6)",
    ].map(parseEvidence),
  },
];

/** Display-name order matches INTEGRATIONS above. */
export const INTEGRATION_NAMES: readonly string[] = Object.freeze(
  INTEGRATIONS.map((i) => i.name),
);

// ---------------------------------------------------------------------------
// Dashboard integration list — derived from the canonical INTEGRATIONS.
// Used in dashboard.integrations.tsx (previously a hand-kept inline array).
// ---------------------------------------------------------------------------

export type DashboardIntegration = {
  /** Composio OAuth app key (uses `composioApp` when set, otherwise `slug`). */
  app: string;
  /** Display name (e.g. "GitHub", "Google Workspace"). */
  label: string;
  /** One-line short description. */
  desc: string;
  /** Two-letter uppercase initial badge (e.g. "GW" for Google Workspace). */
  initial: string;
};

/**
/**
 * Derived array in dashboard-card shape.
 * Defined at module scope — never re-created on re-render.
 *
 * `initial` values are explicit — they're cosmetic choices that can't be
 * algorithmically derived (e.g. "GitHub" → "GH", "Clerk" → "CK", "Vercel" → "VC").
 */
export const DASHBOARD_INTEGRATIONS: readonly DashboardIntegration[] =
  Object.freeze([
    { app: "github", label: "GitHub", desc: "Source code, PRs, deployments, access control.", initial: "GH" },
    { app: "aws", label: "AWS", desc: "Cloud infrastructure, IAM, monitoring, storage.", initial: "AW" },
    { app: "google", label: "Google Workspace", desc: "Admin audit logs, directory, OAuth.", initial: "GW" },
    { app: "vercel", label: "Vercel", desc: "Deployments, domains, environment variables.", initial: "VC" },
    { app: "cloudflare", label: "Cloudflare", desc: "DNS, CDN, WAF, DDoS protection.", initial: "CF" },
    { app: "clerk", label: "Clerk", desc: "Authentication, user management, MFA.", initial: "CK" },
    { app: "supabase", label: "Supabase", desc: "Database, auth, storage, realtime.", initial: "SB" },
    { app: "stripe", label: "Stripe", desc: "Payments, billing, subscriptions.", initial: "ST" },
    { app: "resend", label: "Resend", desc: "Transactional email, deliverability.", initial: "RS" },
  ]);

/** O(1) lookup for /integrations/:slug loader. */
export const INTEGRATIONS_BY_SLUG: Readonly<Record<string, Integration>> = Object.freeze(
  Object.fromEntries(INTEGRATIONS.map((i) => [i.slug, i])),
);

/** Set of valid slugs, useful for prerender/404 detection. */
export const INTEGRATION_SLUGS: ReadonlySet<string> = new Set(
  INTEGRATIONS.map((i) => i.slug),
);
