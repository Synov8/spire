import { db } from "~/db";
import { control, policyCheck } from "~/db/schema";
import { auth } from "~/lib/auth.server";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/dashboard.compliance-export";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const orgId = session.session.activeOrganizationId!;
  const [allControls, verdicts] = await Promise.all([
    db.select().from(control),
    db.select().from(policyCheck).where(eq(policyCheck.organizationId, orgId)),
  ]);

  const verdictByControl = new Map(verdicts.map((v) => [v.ruleId.replace("agent-", ""), v]));

  const frameworks = [...new Set(allControls.map((c) => c.framework))];
  const frameworkSections = frameworks.map((fw) => {
    const fwControls = allControls.filter((c) => c.framework === fw);
    let verified = 0, failed = 0, warnings = 0;
    const results = fwControls.map((c) => {
      const v = verdictByControl.get(c.controlId);
      if (v?.status === "pass") verified++;
      else if (v?.status === "fail") failed++;
      else if (v?.status === "warning") warnings++;
      return { controlId: c.controlId, title: c.title, category: c.category, status: v?.status || "unchecked", detail: v?.detail || null, lastChecked: v?.lastCheckedAt || null };
    });
    return { framework: fw, totalControls: fwControls.length, verdicts: results, summary: { verified, failed, warnings, unchecked: fwControls.length - verdicts.length } };
  });

  return new Response(JSON.stringify({ generatedAt: new Date().toISOString(), organization: session.user.name, frameworks: frameworkSections }, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="synov8studio-export-${new Date().toISOString().split("T")[0]}.json"` },
  });
}
