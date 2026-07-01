import { auth } from "~/lib/auth.server";
import { db } from "~/db";
import { subscription } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Composio } from "@composio/core";
import type { ActionFunctionArgs } from "react-router";

const LIMITS: Record<string, number> = { starter: 3, growth: 10, enterprise: -1 };

// ── Auth config map: composioApp (or slug when identical) → auth config ID ──
// Explicit entries cover integrations whose auth configs are registered in
// the Composio workspace. Every entry below also matches the generic
// `${composioApp}_oauth` fallback produced by `authConfigFor`, so they're
// documentation + override-flexibility rather than load-bearing — the moment
// a new auth config is registered in app.composio.dev under the standard
// naming, the corresponding catalogue entry becomes connectable without
// touching this file.
//
// To wire a new integration:
//   1. Register its auth config at app.composio.dev → Settings → Auth
//      Configs, naming it `${composioApp}_oauth` (e.g. `bamboohr_oauth`).
//   2. (Optional) Add an explicit entry here when you want to override the
//      fallback (e.g. non-OAuth scheme, renamed config).
const AUTH_CONFIGS: Record<string, string> = {
  github: "github_oauth",
  cloudflare: "cloudflare_oauth",
  supabase: "supabase_oauth",
  stripe: "stripe_oauth",
  resend: "resend_oauth",
  neon: "neon_oauth",
  // Underscore-named Composio toolkits — slug ≠ Composio toolkit name
  digital_ocean: "digital_ocean_oauth",
  "_1password": "_1password_oauth",
  anthropic_administrator: "anthropic_administrator_oauth",
};

/**
 * Resolve a composioApp key (or matching slug) to its Composio auth config ID.
 *
 * Lookup order:
 *   1. Explicit entry in AUTH_CONFIGS — used when the wiring diverges from
 *      the generic naming convention (e.g. future non-OAuth schemes).
 *   2. Generic fallback: `${app}_oauth`. Matches Composio's standard
 *      auth-config naming convention used by every entry in
 *      app/lib/integration-data.ts — this is what stretches the wireable
 *      surface to all catalogue entries the moment each auth config is
 *      registered in the workspace.
 *
 * Returns undefined for empty / non-string input so the caller can
 * distinguish a malformed request body (→ 400) from a Composio-side
 * "auth config not found" 4xx (→ propagated from `link()`).
 */
function authConfigFor(app: string | null | undefined): string | undefined {
  if (!app || typeof app !== "string") return undefined;
  if (AUTH_CONFIGS[app]) return AUTH_CONFIGS[app];
  return `${app}_oauth`;
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = session.session.activeOrganizationId!;
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey) return Response.json({ error: "COMPOSIO_API_KEY not set" }, { status: 500 });

  const app = (await request.formData()).get("app") as string;
  if (!app) return Response.json({ error: "Missing app" }, { status: 400 });

  const subs = await db.select().from(subscription).where(eq(subscription.referenceId, orgId));
  const plan = subs.find((s) => s.status === "active" || s.status === "trialing")?.plan || "starter";
  const limit = LIMITS[plan] ?? 3;

  const composio = new Composio({ apiKey });

  if (limit !== -1) {
    const list = await composio.connectedAccounts.list({ userIds: [orgId] });
    const count = ((list as any)?.items || []).length;
    if (count >= limit) {
      return Response.json({ error: `Plan limit (${limit}) reached. Upgrade to connect more.` }, { status: 403 });
    }
  }

  const authConfigId = authConfigFor(app);
  if (!authConfigId) {
    return Response.json({ error: `Unknown integration: ${app}` }, { status: 400 });
  }
  const connectionRequest = await composio.connectedAccounts.link(orgId, authConfigId);
  return Response.json({ redirectUrl: connectionRequest.redirectUrl });
}
