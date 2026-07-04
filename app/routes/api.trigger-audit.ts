import { auth } from "~/lib/auth.server";
import { auth as triggerAuth, tasks } from "@trigger.dev/sdk";
import { db } from "~/db";
import { control, manualEvidence } from "~/db/schema";
import { eq } from "drizzle-orm";
import { cloudflareContext } from "~/lib/cloudflare-context.server";
import type { Route } from "./+types/api.trigger-audit";

export async function loader({ request, context }: Route.LoaderArgs) {
  const userSession = await auth.api.getSession({ headers: request.headers });
  if (!userSession) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = userSession.session.activeOrganizationId;
  if (!orgId) return Response.json({ error: "No active organisation" }, { status: 400 });

  const controlList = await db.select().from(control);
  if (controlList.length === 0) {
    return Response.json({ error: "No controls seeded" }, { status: 500 });
  }

  // Clean up R2 files for this org before running a new audit
  const cf = context.get(cloudflareContext);
  if (cf) {
    const evidences = await db.select().from(manualEvidence).where(eq(manualEvidence.organizationId, orgId));
    for (const ev of evidences) {
      if (ev.fileUrl) {
        const urls = ev.fileUrl.split(",");
        for (const url of urls) {
          const key = url.split("/").slice(3).join("/");
          if (key) {
            try { await cf.env.EVIDENCE_BUCKET.delete(key); } catch { /* ignore */ }
          }
        }
      }
    }
  }

  const handle = await tasks.trigger("run-audit", {
    orgId,
    controls: controlList.map((c) => ({
      controlId: c.controlId,
      category: c.category,
      title: c.title,
      description: c.description,
    })),
  }, {
    tags: [`org:${orgId}`, `audit:${orgId}`],
  });

  const publicToken = await triggerAuth.createPublicToken({
    scopes: { read: { runs: [handle.id] } },
  });

  return Response.json({ runId: handle.id, publicToken });
}
