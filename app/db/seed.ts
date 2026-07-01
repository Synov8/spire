/**
 * Drizzle seed — upserts the canonical SOC 2 + EU AI Act control catalogue
 * into the `control` table. The actual control list lives in
 * `app/data/controls.ts` so the same source of truth powers both the DB and
 * `scripts/self-audit.ts` (the CLI dogfooding auditor).
 *
 * Idempotent: `onConflictDoNothing` keyed on `control.controlId` so re-running
 * the seed against a populated DB is a no-op.
 */

import { db } from "./index";
import { control } from "./schema";
import { CONTROLS } from "../data/controls";

async function seed() {
  for (const c of CONTROLS) {
    await db.insert(control).values(c).onConflictDoNothing({ target: control.controlId });
  }
  const frameworks = [...new Set(CONTROLS.map((c) => c.framework))];
  console.log(`Seeded ${CONTROLS.length} controls across ${frameworks.join(", ")}`);
}

seed().catch(console.error);
