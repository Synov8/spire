import { auth } from "~/lib/auth.server";
import { cloudflareContext } from "~/lib/cloudflare-context.server";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request, context }: ActionFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = session.session.activeOrganizationId;
  if (!orgId) return Response.json({ error: "No active organisation" }, { status: 400 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  const cf = context.get(cloudflareContext);
  const key = `${orgId}/${crypto.randomUUID()}-${file.name}`;

  await cf.env.EVIDENCE_BUCKET.put(key, await file.bytes(), {
    httpMetadata: { contentType: file.type },
  });

  const publicUrl = `https://evidence.${new URL(request.url).hostname}/${key}`;

  return Response.json({ fileUrl: publicUrl, originalFilename: file.name });
}
