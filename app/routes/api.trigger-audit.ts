import { auth } from "~/lib/auth.server";
import { hasActiveSubscription } from "~/lib/subscription-check";
import { db } from "~/db";
import { control } from "~/db/schema";
import { eq } from "drizzle-orm";
import { auth as triggerAuth, tasks } from "@trigger.dev/sdk";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const orgId = url.searchParams.get("orgId");
  if (!orgId || !/^[a-f0-9-]{20,}$/i.test(orgId)) {
    return Response.json({ error: "Invalid orgId" }, { status: 400 });
  }

  const userSession = await auth.api.getSession({ headers: request.headers });
  if (!userSession) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await hasActiveSubscription(orgId, userSession.user.id))) {
    return Response.json({ error: "Subscription required" }, { status: 402 });
  }

  const controlList = await db.select().from(control).where(eq(control.framework, "soc2"));
  if (controlList.length === 0) {
    return Response.json({ error: "No controls seeded" }, { status: 500 });
  }

  const handle = await tasks.trigger("run-audit", {
    orgId,
    controls: controlList.map((c) => ({
      controlId: c.controlId,
      category: c.category,
      title: c.title,
      description: c.description,
    })),
  });

  const publicToken = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [handle.id],
      },
    },
  });

  return Response.json({ runId: handle.id, publicToken });
}
