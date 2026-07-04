import { auth } from "~/lib/auth.server";
import { auth as triggerAuth, tasks } from "@trigger.dev/sdk";
import { db } from "~/db";
import { questionnaire } from "~/db/schema";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/api.investigate-questionnaire";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = session.session.activeOrganizationId;
  if (!orgId) return Response.json({ error: "No active organisation" }, { status: 400 });

  const url = new URL(request.url);
  const questionnaireId = url.searchParams.get("id");
  if (!questionnaireId) return Response.json({ error: "Missing questionnaire id" }, { status: 400 });

  const q = await db.select().from(questionnaire).where(eq(questionnaire.id, questionnaireId)).limit(1).then((r) => r[0]);
  if (!q) return Response.json({ error: "Questionnaire not found" }, { status: 404 });
  if (!q.questions) return Response.json({ error: "No questions to investigate" }, { status: 400 });

  const handle = await tasks.trigger("investigate-questionnaire", {
    orgId,
    questionnaireId,
    questions: q.questions as any[],
  }, {
    tags: [`org:${orgId}`],
  });

  const publicToken = await triggerAuth.createPublicToken({
    scopes: { read: { runs: [handle.id] } },
  });

  return Response.json({ runId: handle.id, publicToken });
}
