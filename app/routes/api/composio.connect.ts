import { auth } from "~/lib/auth.server";
import { db } from "~/db";
import { subscription } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Composio } from "@composio/core";
import { hasActiveSubscription } from "~/lib/subscription-check";
import type { ActionFunctionArgs } from "react-router";

const LIMITS: Record<string, number> = { starter: 3, growth: 10, enterprise: -1 };

// ponytail: app → auth config ID mapping. Create via Composio dashboard.
const AUTH_CONFIGS: Record<string, string> = {
  github: "github_oauth", aws: "aws_oauth", google: "google_oauth",
  vercel: "vercel_oauth", cloudflare: "cloudflare_oauth", clerk: "clerk_oauth",
  supabase: "supabase_oauth", stripe: "stripe_oauth", resend: "resend_oauth",
};

export async function action({ request }: ActionFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = session.session.activeOrganizationId!;
  if (!await hasActiveSubscription(orgId, session.user.id)) {
    return Response.json({ error: "Active subscription required. Go to /pricing to subscribe." }, { status: 402 });
  }
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

  const connectionRequest = await composio.connectedAccounts.link(orgId, AUTH_CONFIGS[app]);
  return Response.json({ redirectUrl: connectionRequest.redirectUrl });
}
