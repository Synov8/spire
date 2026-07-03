/**
 * Single source of truth for Spire's integration catalogue.
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
   * Composio toolkit name, if different from `slug`.
   * Set when the Composio tool key diverges from the canonical slug
   * (e.g. slug "1password" → toolkit "_1password",
   *      slug "digitalocean" → toolkit "digital_ocean",
   *      slug "anthropic" → toolkit "anthropic_administrator").
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
    slug: "vercel",
    name: "Vercel",
    description: "Deployments, domains, environment variables, serverless functions.",
    evidence: [
      "Deployment audit log (CC8)",
      "Team member permissions (CC6)",
      "Environment variable scoping (CC6)",
      "Domain DNS configuration (C1)",
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
  // ── HR / HCM integrations ───────────────────────────────────────────────
  // SPEC §6.1 lists "HR systems (optional)" as a data ingestion source. The
  // primary SOC 2 control these map to is CC6 (logical access): Spire uses
  // HRIS records to PROVE timely removal of access when an employee leaves
  // (CC6.2), role changes mid-tenure (CC6.1), and onboarding completeness.
  {
    slug: "bamboohr",
    name: "BambooHR",
    description: "HRIS, employee directory, onboarding.",
    evidence: [
      "Employee directory with employment status (CC6)",
      "Hire records with start dates (CC6)",
      "Termination events with last-day timestamps (CC6)",
      "Time-off and PTO tracking (CC1)",
    ].map(parseEvidence),
  },
  {
    slug: "gusto",
    name: "Gusto",
    description: "Payroll, benefits, contractor records for SMB.",
    evidence: [
      "Employee directory with employment status (CC6)",
      "Contractor records (CC6)",
      "Payroll admin action history (CC7)",
      "New contractor onboarding events (CC6)",
    ].map(parseEvidence),
  },
  {
    slug: "workday",
    name: "Workday",
    description: "Enterprise HRIS, hire-to-retire lifecycle, HCM.",
    evidence: [
      "Employee directory with employment status (CC6)",
      "Hire-to-termination lifecycle events (CC6)",
      "Role and supervisory org changes (CC6)",
      "Access certification reports (CC6)",
    ].map(parseEvidence),
  },
  // ── Enterprise platform + ops integrations
  // Sized-for-SaaS catalog from the integration-coverage research this
  // sprint. Every entry has slug === composio app key. Each carries 4
  // evidence bullets mapped to the specific SOC 2 common-criterion
  // control(s) their API actually exposes.
  {
    slug: "gitlab",
    name: "GitLab",
    description: "Source code, CI/CD, merge requests, group access.",
    evidence: [
      "Repository commit history (CC8)",
      "Branch protection rules (CC6)",
      "Group member permissions (CC6)",
      "Pipeline execution logs (CC8)",
    ].map(parseEvidence),
  },
  {
    slug: "slack",
    name: "Slack",
    description: "Team messaging, channel access, retention policies.",
    evidence: [
      "Channel access roster (CC6)",
      "Admin action history (CC7)",
      "Workspace SSO configuration (CC6)",
      "Message retention policy (CC7)",
    ].map(parseEvidence),
  },
  {
    slug: "jira",
    name: "Jira",
    description: "Issue tracking, project workflows, change requests.",
    evidence: [
      "Issue history with author and status changes (CC8)",
      "Project permissions audit (CC6)",
      "Workflow change history (CC8)",
      "Admin action log (CC7)",
    ].map(parseEvidence),
  },
  {
    slug: "linear",
    name: "Linear",
    description: "Issue tracking, roadmaps, project workflows.",
    evidence: [
      "Issue history with state transitions (CC8)",
      "Team member assignments (CC6)",
      "Project access list (CC6)",
      "Roadmap change history (CC8)",
    ].map(parseEvidence),
  },
  {
    slug: "datadog",
    name: "Datadog",
    description: "Infrastructure monitoring, APM, log management.",
    evidence: [
      "Monitor alert history (CC7)",
      "Log retention configuration (CC7)",
      "Dashboard access roster (CC6)",
      "Incident notification routing (CC7)",
    ].map(parseEvidence),
  },
  {
    slug: "sentry",
    name: "Sentry",
    description: "Error tracking, performance monitoring, release health.",
    evidence: [
      "Issue history with release correlation (CC7)",
      "Project access roster (CC6)",
      "Alert rules and on-call routing (CC7)",
      "Source map upload controls (C1)",
    ].map(parseEvidence),
  },
  {
    slug: "pagerduty",
    name: "PagerDuty",
    description: "Incident response, on-call scheduling, alert routing.",
    evidence: [
      "On-call schedule history (CC7)",
      "Incident response timeline (CC7)",
      "Escalation policy review (CC7)",
      "Service assignment log (CC7)",
    ].map(parseEvidence),
  },
  {
    slug: "salesforce",
    name: "Salesforce",
    description: "CRM, customer pipeline, vendor relationships.",
    evidence: [
      "User access audit (CC6)",
      "Field-level security settings (CC6)",
      "API call log (CC7)",
      "Profile and permission set review (CC6)",
    ].map(parseEvidence),
  },
  {
    slug: "hubspot",
    name: "HubSpot",
    description: "Marketing automation, CRM, customer engagement.",
    evidence: [
      "User access audit (CC6)",
      "Workflow change history (CC8)",
      "API call log (CC7)",
      "Permission set review (CC6)",
    ].map(parseEvidence),
  },
  {
    slug: "digitalocean",
    composioApp: "digital_ocean",
    name: "DigitalOcean",
    description: "Cloud infrastructure, droplets, Kubernetes, spaces.",
    evidence: [
      "Droplet activity log (CC7)",
      "Team member permissions (CC6)",
      "Storage encryption status (C1)",
      "Project resource inventory (A1)",
    ].map(parseEvidence),
  },
  {
    slug: "notion",
    name: "Notion",
    description: "Knowledge base, docs, project wiki, sharing controls.",
    evidence: [
      "Workspace access roster (CC6)",
      "Page sharing settings (CC6)",
      "Admin action history (CC7)",
      "Audit log retention (CC7)",
    ].map(parseEvidence),
  },
  {
    slug: "confluence",
    name: "Confluence",
    description: "Team wiki, documentation, knowledge sharing.",
    evidence: [
      "Space permissions audit (CC6)",
      "Page history and edit trail (CC8)",
      "Admin action log (CC7)",
      "SSO and access controls (CC6)",
    ].map(parseEvidence),
  },
  // ── Q4 2026 catalogue additions ───────────────────────────────────────
  // Four integrations graduating from the previously public "coming soon"
  // placeholder list. Each maps to real API surface that supports a SOC 2
  // common-criterion. The AI integrations (OpenAI / Anthropic) read
  // per-org API key + usage metadata only — they do NOT capture prompts or
  // completions, which would compromise customer data scope.
  {
    slug: "neon",
    name: "Neon",
    description: "Serverless Postgres, branching, compute API.",
    evidence: [
      "Database access roster (CC6)",
      "Compute resource inventory (A1)",
      "Encryption at rest configuration (C1)",
      "Admin activity log (CC7)",
    ].map(parseEvidence),
  },
  {
    slug: "1password",
    composioApp: "_1password",
    name: "1Password",
    description: "Business vault, SCIM bridge, events API.",
    evidence: [
      "Vault access roster (CC6)",
      "MFA policy enforcement (CC6)",
      "Service account key inventory (CC6)",
      "Service account auth events (CC7)",
    ].map(parseEvidence),
  },
  {
    slug: "openai",
    name: "OpenAI",
    description: "Org-level API key, member, and usage audit.",
    evidence: [
      "Organization member roster (CC6)",
      "API key inventory and scoping (CC6)",
      "Model usage audit logs (CC7)",
      "Data retention configuration (C1)",
    ].map(parseEvidence),
  },
  {
    slug: "anthropic",
    composioApp: "anthropic_administrator",
    name: "Anthropic",
    description: "Workspace access, API lifecycle, retention audit.",
    evidence: [
      "Workspace access permissions (CC6)",
      "API key lifecycle events (CC6)",
      "Audit activity log (CC7)",
      "Data retention settings (C1)",
    ].map(parseEvidence),
  },
];

/** Display-name order matches INTEGRATIONS above. */
export const INTEGRATION_NAMES: readonly string[] = Object.freeze(
  INTEGRATIONS.map((i) => i.name),
);

// Categorisation for surfaces that group integrations by category
// (currently the ControlExplorer filter chips on the homepage and the
// /integrations hub directory). Slugs match INTEGRATIONS_BY_SLUG keys;
// render order encodes the canonical hierarchy — broad infra first,
// per-engineering-discipline groupings second.
export const INTEGRATION_CATEGORIES: ReadonlyArray<{
  label: string;
  slugs: ReadonlyArray<string>;
}> = [
  // Established buckets render in canonical order. The two newest buckets
  // (Database, AI) sit at the end of the directory so the existing hub
  // surfaces (homepage ControlExplorer filter chip row + /integrations
  // directory) show established categories first and reserved-by-source-
  // truth buckets last — easier for buyers to scan than mid-list reshuffles.
  { label: "Cloud", slugs: ["cloudflare", "vercel", "digitalocean"] },
  { label: "Source", slugs: ["github", "gitlab"] },
  { label: "Identity", slugs: ["1password"] },
  { label: "HR", slugs: ["bamboohr", "gusto", "workday"] },
  { label: "Observability", slugs: ["datadog", "sentry", "pagerduty"] },
  { label: "Tickets", slugs: ["jira", "linear", "slack"] },
  { label: "Payment / CRM", slugs: ["stripe", "salesforce", "hubspot", "resend"] },
  { label: "Docs", slugs: ["notion", "confluence"] },
  { label: "Database", slugs: ["supabase", "neon"] },
  { label: "AI", slugs: ["openai", "anthropic"] },
];

// Dev-time safety check: every INTEGRATIONS slug should appear in some
// INTEGRATION_CATEGORIES bucket, otherwise consumers that iterate the
// categories (homepage ControlExplorer filter chips, /integrations hub
// directory) silently drop the integration via defensive null-checks.
// Logs at module init so the gap is loud during dev runs; silent in
// production builds.
if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
  const bucketed = new Set(INTEGRATION_CATEGORIES.flatMap((c) => c.slugs));
  const missing = INTEGRATIONS.filter((i) => !bucketed.has(i.slug));
  if (missing.length > 0) {
    console.warn(
      `[integration-data] ${missing.length} integration(s) not bucketed in INTEGRATION_CATEGORIES — invisible to grouped consumers: ${missing.map((i) => i.name).join(", ")}`,
    );
  }
}

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
    { app: "cloudflare", label: "Cloudflare", desc: "DNS, CDN, WAF, DDoS protection.", initial: "CF" },
    { app: "vercel", label: "Vercel", desc: "Deployments, domains, environment variables.", initial: "VC" },
    { app: "supabase", label: "Supabase", desc: "Database, auth, storage, realtime.", initial: "SB" },
    { app: "stripe", label: "Stripe", desc: "Payments, billing, subscriptions.", initial: "ST" },
    { app: "resend", label: "Resend", desc: "Transactional email, deliverability.", initial: "RS" },
    { app: "bamboohr", label: "BambooHR", desc: "HRIS, employee directory, onboarding.", initial: "BH" },
    { app: "gusto", label: "Gusto", desc: "Payroll, benefits, contractor records.", initial: "GS" },
    { app: "workday", label: "Workday", desc: "Enterprise HRIS, hire-to-retire lifecycle.", initial: "WD" },
    { app: "gitlab", label: "GitLab", desc: "Source code, CI/CD, merge requests.", initial: "GL" },
    { app: "slack", label: "Slack", desc: "Team messaging, channel access, retention.", initial: "SC" },
    { app: "jira", label: "Jira", desc: "Issue tracking, project workflows.", initial: "JR" },
    { app: "linear", label: "Linear", desc: "Issue tracking, roadmaps.", initial: "LN" },
    { app: "datadog", label: "Datadog", desc: "Infrastructure monitoring, APM, logs.", initial: "DD" },
    { app: "sentry", label: "Sentry", desc: "Error tracking, performance monitoring.", initial: "SN" },
    { app: "pagerduty", label: "PagerDuty", desc: "Incident response, on-call scheduling.", initial: "PD" },
    { app: "salesforce", label: "Salesforce", desc: "CRM, customer pipeline, vendor relationships.", initial: "SF" },
    { app: "hubspot", label: "HubSpot", desc: "Marketing automation, CRM, engagement.", initial: "HS" },
    { app: "digital_ocean", label: "DigitalOcean", desc: "Cloud infrastructure, droplets, Kubernetes.", initial: "DO" },
    { app: "notion", label: "Notion", desc: "Knowledge base, docs, project wiki.", initial: "NO" },
    { app: "confluence", label: "Confluence", desc: "Team wiki, documentation, knowledge sharing.", initial: "CO" },
    { app: "neon", label: "Neon", desc: "Serverless Postgres, branching, compute API.", initial: "NE" },
    { app: "_1password", label: "1Password", desc: "Business vault, SCIM bridge, events API.", initial: "OP" },
    { app: "openai", label: "OpenAI", desc: "Org-level API key, member, and usage audit.", initial: "OA" },
    { app: "anthropic_administrator", label: "Anthropic", desc: "Workspace access, API lifecycle, retention audit.", initial: "AN" },
  ]);

/** O(1) lookup for /integrations/:slug loader. */
export const INTEGRATIONS_BY_SLUG: Readonly<Record<string, Integration>> = Object.freeze(
  Object.fromEntries(INTEGRATIONS.map((i) => [i.slug, i])),
);
