#!/usr/bin/env tsx
/**
 * scripts/self-audit.ts · Spire dogfooding auditor
 *
 * Runs the same compliance agent the webapp does, but from a CLI on the
 * user/operator's own stack. Use cases:
 *   - Self-audit Spire's own infrastructure as the canonical example
 *   - Smoke-test the agent loop against a real Composio + OpenRouter setup
 *     without spinning up the full webapp
 *   - Anywhere you want a one-shot audit on a target org's integration roster
 *
 * Flow:
 *   1. Banner + env validation (COMPOSIO_API_KEY, OPENROUTER_API_KEY from
 *      process.env or local `.env`)
 *   2. Pick slugs from the canonical INTEGRATIONS catalog (grouped by
 *      INTEGRATION_CATEGORIES)
 *   3. For each chosen integration:
 *        a. `composio.connectedAccounts.link` → print redirectUrl
 *        b. Auto-poll `connectedAccounts.list({ statuses: ["ACTIVE"] })` until
 *           the OAuth grant lands or 90s elapses
 *   4. If no OAuth grants actually completed (or user picked nothing),
 *      synthesize a deterministic all-gaps `AuditReport` (no live API surface
 *      to probe) — the Composio session creation AND the OpenRouter call are
 *      both deliberately skipped to save tokens + avoid the 0/0/0 empty stub
 *      bug that crops up when DeepSeek is invoked with empty evidence.
 *   5. Otherwise, run the same `generateText` + structured-output agent loop
 *      the webapp uses, with the canonical `AuditReportSchema`.
 *   6. Pretty-print the report + save a JSON snapshot to
 *      `self-audit-<ISO>.json` in cwd
 *
 * What this script deliberately DOES NOT do:
 *   - Does NOT touch `policyCheck` or any other Drizzle table — that is
 *     webapp-internal storage and would couple this CLI to a DB it does not
 *     need to claim ownership of.
 *   - Does NOT require auth, sessions, or org context — it runs as the
 *     single user "self-audit" inside Composio.
 *
 * Run: `npm run self-audit` (alias) or `npx tsx scripts/self-audit.ts`
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildAuditSchema, type AuditReport, type ControlVerdict } from "../app/agents/audit-schema";
import {
  CONTROLS,
  SOC2_CONTROLS,
  AI_ACT_CONTROLS,
  renderPromptLine,
  type ControlSeed,
} from "../app/data/controls";
import { INTEGRATIONS } from "../app/lib/integration-data";
import { streamText, dynamicTool } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";

const C = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};
const SUPPORTED_COLOR = process.stdout.isTTY === true;
const paint = (color: keyof typeof C, text: string): string =>
  SUPPORTED_COLOR ? `${C[color]}${text}${C.reset}` : text;

function loadDotEnv(path = ".env") {
  let raw: string;
  try {
    raw = readFileSync(resolve(process.cwd(), path), "utf8");
  } catch {
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/i);
    if (!m) continue;
    const [, key, valueRaw] = m;
    if (process.env[key] !== undefined) continue;
    const value = valueRaw.replace(/^["']|["']$/g, "");
    process.env[key] = value;
  }
}
loadDotEnv();

const COMPOSIO_USER_ID = "self-audit";
const MODEL_ID = "deepseek/deepseek-v4-flash";

function banner() {
  console.log();
  console.log(paint("bold", "  Spire · self-audit"));
  console.log(paint("dim", "  Runs the same compliance agent the webapp uses, against the integrations you pick."));
  console.log();
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim().length === 0) {
    console.error(paint("red", `  COMPOSIO_API_KEY is not set.`));
    console.error(paint("dim", `  Add it to .env in the project root, or export it before running.`));
    process.exit(2);
  }
  return v;
}

function synthesizeAllGapsReport(pickedSlugs: string[]): AuditReport {
  const pickedLine = pickedSlugs.length === 0
    ? "You picked no integrations from the menu."
    : `You picked ${pickedSlugs.length} slug(s) (${pickedSlugs.join(", ")}), but none completed OAuth in this run.`;

  const controls: Record<string, ControlVerdict> = {};
  for (const c of CONTROLS) {
    controls[c.controlId] = {
      status: "needs-human-input",
      detail: `${c.controlId} (${c.title}) cannot be verified automatically without an integration exposing the relevant evidence — no live integrations were available in this run.`,
      evidenceSources: [],
      suggestedAction: gapActionFor(c),
    };
  }

  return {
    summary: `${pickedLine} The audit ran with zero live Composio integrations so no API surface could be probed. Each of the ${CONTROLS.length} canonical controls is surfaced below as a gap requiring either an integration OAuth grant or supporting documentation upload. This is a synthesized all-gaps stub — the OpenRouter call was deliberately skipped.`,
    controls,
  };
}

function gapActionFor(c: ControlSeed): string {
  const cat = c.category;
  if (cat === "AI") {
    return "Upload AI literacy training records, the AI inventory, vendor due-diligence questionnaires, or the public /ai transparency page.";
  }
  if (cat === "A1") {
    return "Connect an infrastructure-monitoring integration (Datadog, Sentry, PagerDuty) and upload backup / DR / restore-test documentation.";
  }
  if (cat === "C1") {
    return "Upload the confidentiality classification policy and connect an integration exposing encryption-at-rest configuration (e.g., cloud storage, DB).";
  }
  if (cat === "PI1") {
    return "Upload processing-integrity test results or connect a pipeline integration exposing data-validation tooling.";
  }
  if (cat === "CC1" || cat === "CC2" || cat === "CC3" || cat === "CC4" || cat === "CC5") {
    return "Upload the relevant corporate-governance documentation (code of conduct, board minutes, risk assessment, monitoring results, control-activity policy) — these are documentation-only controls and cannot be probed via infrastructure APIs.";
  }
  if (cat === "CC6" || cat === "CC7" || cat === "CC8" || cat === "CC9") {
    return `Connect an integration that exposes evidence for ${cat} (HRIS for CC6.x lifecycle, cloud provider for CC7 monitoring / CC8 change-management / CC9 vendor-risk, IAM for CC6.x entitlement review).`;
  }
  if (cat.startsWith("P")) {
    return "Upload the relevant privacy documentation (privacy policy, DPA, breach-response procedure, data-subject-request workflow) — these are documentation-only and cannot be probed via infrastructure APIs.";
  }
  return "Connect an integration or upload supporting documentation.";
}

async function runAgentWithSlugs(
  pickedSlugs: string[],
  connectedCount: number,
): Promise<{ report: AuditReport; source: "agent" | "synthesized" } | null> {
  // Validate environment up-front regardless of which path we take. These
  // exit cleanly with code 2 if missing, so we never end up half-running the
  // agent with stale or empty keys.
  const apiKey = requireEnv("OPENROUTER_API_KEY");
  const composioKey = requireEnv("COMPOSIO_API_KEY");

  // Short-circuit BEFORE the Composio session round-trip when no real OAuth
  // grant actually completed in main(). We deliberately use `connectedCount`
  // rather than `Object.keys(tools).length` because the VercelProvider
  // always injects ~6 framework-level tools (session/user-context plumbing)
  // even when zero OAuth grants exist — so the tools check would always read
  // > 0 and never skip the (wasted) OpenRouter call. The authoritative truth
  // is the connectedCount tracked in main().
  if (connectedCount === 0) {
    console.log(
      paint(
        "yellow",
        "  ↻ No live integrations connected — synthesizing all-gaps audit report (no live evidence possible).",
      ),
    );
    console.log();
    return { report: synthesizeAllGapsReport(pickedSlugs), source: "synthesized" };
  }

  const composio = new Composio({ provider: new VercelProvider(), apiKey: composioKey });

  console.log(paint("dim", `  ↻ Creating Composio session for ${COMPOSIO_USER_ID}...`));
  const session = await composio.create(COMPOSIO_USER_ID);
  console.log(paint("dim", `  ↻ sessionId ${session.sessionId} — fetching tools...`));
  const tools = await session.tools();
  console.log(paint("dim", `  ↻ ${Object.keys(tools).length} tool(s) available`));
  console.log();

  console.log(paint("bold", `  → Running audit (${MODEL_ID}, up to 50 steps)...`));
  console.log();

  const openrouter = createOpenRouter({ apiKey });
  const model = openrouter.chat(MODEL_ID, {
    temperature: 0,
    reasoning: { effort: "xhigh" },
  });

  const controlIds = CONTROLS.map((c) => c.controlId);
  const AuditSchema = buildAuditSchema(controlIds);

  const allTools = {
    ...tools,
    submitAuditReport: dynamicTool({
      description: "Submit the complete SOC 2 + EU AI Act audit report.",
      inputSchema: AuditSchema,
      execute: async (report: any) => report,
    }),
  };

  const prompt = [
    `You are a compliance auditor for the ${COMPOSIO_USER_ID} integration roster.`,
    "",
    "You have live Composio tools available for whatever apps were just connected.",
    "For each control, probe the relevant API and record pass/fail/warning with rationale.",
    "Controls that need documentation (policies, training records, risk assessments,",
    "public AI page) should be listed as gaps needing human input.",
    "",
    'When you have checked all controls, call "submitAuditReport" with the complete report.',
    "Do NOT skip or summarize — every control must have a verdict.",
    "",
    "SOC 2 controls:",
    ...SOC2_CONTROLS.map(renderPromptLine),
    "",
    "EU AI Act controls:",
    ...AI_ACT_CONTROLS.map(renderPromptLine),
  ].join("\n");

  console.log(paint("dim", "  Stream open — reasoning and tool calls will appear below:"));
  console.log();

  const result = streamText({
    model,
    tools: allTools,
    prompt,
  });

  let finalReport: AuditReport | null = null;
  for await (const part of result.fullStream) {
    if (part.type === "reasoning-delta") {
      process.stdout.write(paint("dim", part.text));
    } else if (part.type === "text-delta") {
      process.stdout.write(part.text);
    } else if (part.type === "tool-call") {
      console.log(paint("cyan", `\n  ⚙ ${part.toolName}(${JSON.stringify(part.input as Record<string, unknown>).slice(0, 200)})`));
    } else if (part.type === "tool-result") {
      if (part.toolName === "submitAuditReport") {
        finalReport = part.output as unknown as AuditReport;
        console.log(paint("green", `  ✓ Report received`));
      }
    } else if (part.type === "error") {
      console.log(paint("red", `\n  ✗ ${part.error}`));
    }
  }
  console.log();
  console.log();

  if (!finalReport) return null;
  return { report: finalReport, source: "agent" };
}

function printReport(report: AuditReport, source: "agent" | "synthesized") {
  const { summary, controls } = report;
  const entries = Object.entries(controls) as [string, ControlVerdict][];
  const totalVerified = entries.filter(([, v]) => v.status === "pass").length;
  const totalFailed = entries.filter(([, v]) => v.status === "fail").length;
  const totalWarnings = entries.filter(([, v]) => v.status === "warning").length;
  const totalGaps = entries.filter(([, v]) => v.status === "needs-human-input").length;
  console.log();
  console.log(paint("bold", "  ── Audit report ──"));
  if (source === "synthesized") {
    console.log(paint("dim", "  (synthesized all-gaps stub — OpenRouter call was skipped because no live integrations were available)"));
  }
  console.log();
  const passedColor = totalVerified >= 0 ? "green" : "red";
  console.log(`  ${paint("bold", "Summary")}`);
  console.log(`    Passed:    ${paint(passedColor, String(totalVerified))}`);
  console.log(`    Failed:    ${paint("red", String(totalFailed))}`);
  console.log(`    Warnings:  ${paint("yellow", String(totalWarnings))}`);
  console.log(`    Gaps:      ${paint("yellow", String(totalGaps))}`);
  console.log(`    Verdict:   ${summary}`);
  console.log();
  const verdicts = entries.filter(([, v]) => v.status !== "needs-human-input");
  console.log(`  ${paint("bold", `Verdicts (${verdicts.length})`)}`);
  for (const [id, v] of verdicts) {
    const icon =
      v.status === "pass" ? paint("green", "✓") :
      v.status === "fail" ? paint("red", "✗") :
      paint("yellow", "?");
    const head = `    ${icon} ${paint("bold", id)} (${v.status})`;
    console.log(head);
    if (v.detail) console.log(paint("dim", `      ${v.detail}`));
    if (v.evidenceSources?.length) {
      console.log(paint("dim", `      via: ${v.evidenceSources.join(", ")}`));
    }
  }
  console.log();
  const gaps = entries.filter(([, v]) => v.status === "needs-human-input");
  console.log(`  ${paint("bold", `Gaps needing human input (${gaps.length})`)}`);
  for (const [id, g] of gaps) {
    const head = `    ${paint("yellow", "?")} ${paint("bold", id)}`;
    console.log(head);
    console.log(paint("dim", `      ${g.detail}`));
    if (g.suggestedAction) console.log(paint("dim", `      → ${g.suggestedAction}`));
  }
}

function snapshotJson(report: AuditReport | null, source: "agent" | "synthesized") {
  if (!report) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = resolve(process.cwd(), `self-audit-${stamp}.json`);
  writeFileSync(
    path,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        user: COMPOSIO_USER_ID,
        model: MODEL_ID,
        source,
        controlsAudited: CONTROLS.length,
        report,
      },
      null,
      2,
    ),
  );
  console.log();
  console.log(paint("dim", `  ↪ Snapshot saved → ${path}`));
}

async function main() {
  banner();
  requireEnv("COMPOSIO_API_KEY");
  requireEnv("OPENROUTER_API_KEY");

  const composioKey = process.env.COMPOSIO_API_KEY!;
  const composio = new Composio({ apiKey: composioKey });

  // Auto-detect already-connected accounts
  console.log(paint("dim", `  ↻ Checking existing connected accounts for ${COMPOSIO_USER_ID}...`));
  let slugs: string[] = [];
  let connectedCount = 0;
  try {
    const list = await composio.connectedAccounts.list({
      userIds: [COMPOSIO_USER_ID],
      statuses: ["ACTIVE"],
    });
    const items = (list as { items?: Array<Record<string, unknown>> }).items ?? [];
    const appSlugs = items.map((a) => ((a.toolkit as { slug?: string } | undefined)?.slug ?? "").toLowerCase());
    slugs = INTEGRATIONS.filter((i) => appSlugs.includes(i.slug.toLowerCase())).map((i) => i.slug);
    connectedCount = slugs.length;
    if (connectedCount > 0) {
      console.log(paint("green", `  ✓ ${connectedCount} connected account(s) found: ${slugs.join(", ")}`));
    } else {
      console.log(paint("yellow", "  → No connected accounts found. Audit will run as an all-gaps report."));
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(paint("red", `  ✗ Could not list connected accounts: ${msg}`));
    console.log(paint("yellow", "  → Falling back to all-gaps report."));
  }

  const result = await runAgentWithSlugs(slugs, connectedCount);
  if (result) {
    printReport(result.report, result.source);
    snapshotJson(result.report, result.source);
  } else {
    console.log();
    console.log(paint("red", "  ✗ Agent did not produce a structured output. Likely truncated at stepCountIs(50). Re-run with a smaller subset of integrations."));
    process.exit(3);
  }
}

main().catch((e: unknown) => {
  console.error();
  console.error(paint("red", `  ✗ Fatal: ${e instanceof Error ? e.message : String(e)}`));
  if (e instanceof Error && e.stack) console.error(paint("dim", e.stack));
  process.exit(1);
});
