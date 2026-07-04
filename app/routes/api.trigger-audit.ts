import { auth } from "~/lib/auth.server";
import { auth as triggerAuth, tasks } from "@trigger.dev/sdk";
import { db } from "~/db";
import { control } from "~/db/schema";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const userSession = await auth.api.getSession({ headers: request.headers });
  if (!userSession) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = userSession.session.activeOrganizationId;
  if (!orgId) return Response.json({ error: "No active organisation" }, { status: 400 });

  const controlList = await db.select().from(control);
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
  }, {
    tags: [`org:${orgId}`],
  });

  const publicToken = await triggerAuth.createPublicToken({
    scopes: { read: { runs: [handle.id] } },
  });

  return Response.json({ runId: handle.id, publicToken });
}
