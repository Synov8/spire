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

import { createInterface } from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { AuditReportSchema, type AuditReport } from "../app/agents/audit-schema";
import {
  CONTROLS,
  SOC2_CONTROLS,
  AI_ACT_CONTROLS,
  renderPromptLine,
  type ControlSeed,
} from "../app/data/controls";
import { INTEGRATIONS, INTEGRATION_CATEGORIES } from "../app/lib/integration-data";
import { generateText, stepCountIs, Output } from "ai";
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
const OAUTH_TIMEOUT_MS = 90_000;
const POLL_INTERVAL_MS = 2_500;
const MODEL_ID = "deepseek/deepseek-v4-flash";

function authConfigIdFor(slug: string): string {
  const integ = INTEGRATIONS.find((i) => i.slug === slug);
  const base = integ?.composioApp ?? slug;
  return `${base}_oauth`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

function renderIntegrationMenu(): string {
  const lines: string[] = [];
  lines.push(paint("bold", "  Available integrations (grouped by category):"));
  lines.push("");
  let idx = 1;
  type Row = { idx: number; slug: string; name: string; category: string };
  const rows: Row[] = [];
  for (const cat of INTEGRATION_CATEGORIES) {
    lines.push(paint("cyan", `  ${cat.label}`));
    for (const slug of cat.slugs) {
      const integ = INTEGRATIONS.find((i) => i.slug === slug)!;
      const compat = authConfigIdFor(slug);
      const compatNote = integ.composioApp && integ.composioApp !== slug
        ? paint("dim", ` ↦ ${compat}`)
        : "";
      lines.push(
        `    ${paint("yellow", String(idx).padStart(2))}. ${integ.name.padEnd(20)} ${paint("dim", integ.description)}${compatNote}`,
      );
      rows.push({ idx, slug, name: integ.name, category: cat.label });
      idx++;
    }
    lines.push("");
  }
  return lines.join("\n") + `\n  ${rows.length} integrations total.\n`;
}

function ask(question: string): Promise<string> {
  const rl = createInterface({ input, output });
  return new Promise((resolvePrompt) => {
    rl.question(question, (answer) => {
      rl.close();
      resolvePrompt(answer);
    });
  });
}

async function pickIntegrations(): Promise<string[]> {
  console.log(renderIntegrationMenu());
  const answer = await ask(
    paint(
      "bold",
      "  Which integrations do you have? (comma-separated slugs, numbers, or 'all')\n  > ",
    ),
  );
  const trimmed = answer.trim().toLowerCase();
  if (!trimmed) return [];
  if (trimmed === "all" || trimmed === "*") return INTEGRATIONS.map((i) => i.slug);

  const allByIdx = INTEGRATION_CATEGORIES.flatMap((c) => c.slugs);
  const wantedSlugs = new Set<string>();
  for (const tok of trimmed.split(/[,\s]+/).filter(Boolean)) {
    if (/^\d+$/.test(tok)) {
      const n = Number(tok);
      if (n >= 1 && n <= allByIdx.length) wantedSlugs.add(allByIdx[n - 1]);
    } else {
      wantedSlugs.add(tok);
    }
  }
  const valid = [...wantedSlugs].filter((s) => INTEGRATIONS.some((i) => i.slug === s));
  const dropped = [...wantedSlugs].filter((s) => !valid.includes(s));
  if (dropped.length) {
    console.log(paint("dim", `  (ignored unknown slugs: ${dropped.join(", ")})`));
  }
  return valid;
}

async function grantOne(
  composio: Composio,
  slug: string,
  label: string,
): Promise<{ ok: boolean; reason?: string }> {
  const authConfig = authConfigIdFor(slug);
  console.log();
  console.log(`  ${paint("bold", label)} → ${paint("dim", authConfig)}`);

  let redirectUrl: string;
  try {
    const req = await composio.connectedAccounts.link(COMPOSIO_USER_ID, authConfig);
    redirectUrl = req.redirectUrl;
    if (!redirectUrl) {
      return { ok: false, reason: "no redirectUrl returned" };
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: `link() failed: ${msg}` };
  }

  console.log(paint("yellow", `    ↳ Open this URL in your browser within ${Math.round(OAUTH_TIMEOUT_MS / 1000)}s:`));
  console.log(paint("cyan", `      ${redirectUrl}`));
  console.log(paint("dim", `    ↳ Auto-polling Composio for ACTIVE status...`));

  const start = Date.now();
  while (Date.now() - start < OAUTH_TIMEOUT_MS) {
    await sleep(POLL_INTERVAL_MS);
    try {
      const list = await composio.connectedAccounts.list({
        userIds: [COMPOSIO_USER_ID],
        statuses: ["ACTIVE"],
      });
      const items = (list as { items?: Array<Record<string, unknown>> }).items ?? [];
      const matched = items.some((it) => {
        const candidates = [
          it.appName,
          (it.toolkit as { slug?: string } | undefined)?.slug,
          it.appUniqueId,
        ].filter(Boolean) as string[];
        return candidates.some(
          (c) => c === slug || c === authConfig.replace(/_oauth$/, ""),
        );
      });
      if (matched) {
        console.log(paint("green", `    ✓ Connected ${label}`));
        return { ok: true };
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(paint("dim", `    · poll failed (${msg.slice(0, 60)}), retrying...`));
    }
  }
  return { ok: false, reason: `timed out after ${Math.round(OAUTH_TIMEOUT_MS / 1000)}s` };
}

function synthesizeAllGapsReport(pickedSlugs: string[]): AuditReport {
  const pickedLine = pickedSlugs.length === 0
    ? "You picked no integrations from the menu."
    : `You picked ${pickedSlugs.length} slug(s) (${pickedSlugs.join(", ")}), but none completed OAuth in this run.`;

  return {
    summary: {
      totalVerified: 0,
      totalFailed: 0,
      totalWarnings: 0,
      overallAssessment: `${pickedLine} The audit ran with zero live Composio integrations so no API surface could be probed. Each of the ${CONTROLS.length} canonical controls is surfaced below as a gap requiring either an integration OAuth grant or supporting documentation upload. This is a synthesized all-gaps stub — the OpenRouter call was deliberately skipped.`,
    },
    verdicts: [],
    gapsNeedingHumanInput: CONTROLS.map((c) => ({
      controlId: c.controlId,
      description: `${c.controlId} (${c.title}) cannot be verified automatically without an integration exposing the relevant evidence — no live integrations were available in this run.`,
      suggestedAction: gapActionFor(c),
    })),
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
  const prompt = [
    `You are a compliance auditor for the ${COMPOSIO_USER_ID} integration roster.`,
    "",
    "You have live Composio tools available for whatever apps were just connected.",
    "For each control, probe the relevant API and record pass/fail/warning with rationale.",
    "Controls that need documentation (policies, training records, risk assessments,",
    "public AI page) should be listed as gaps needing human input.",
    "",
    "SOC 2 controls:",
    ...SOC2_CONTROLS.map(renderPromptLine),
    "",
    "EU AI Act controls:",
    ...AI_ACT_CONTROLS.map(renderPromptLine),
  ].join("\n");

  const result = await generateText({
    model,
    tools,
    output: Output.object({ schema: AuditReportSchema, name: "AuditReport", description: "SOC 2 + EU AI Act compliance audit results" }),
    stopWhen: stepCountIs(50),
    prompt,
  });
  const report = (result.output as AuditReport | undefined) ?? null;
  if (!report) return null;
  return { report, source: "agent" };
}

function printReport(report: AuditReport, source: "agent" | "synthesized") {
  const { summary, verdicts, gapsNeedingHumanInput } = report;
  console.log();
  console.log(paint("bold", "  ── Audit report ──"));
  if (source === "synthesized") {
    console.log(paint("dim", "  (synthesized all-gaps stub — OpenRouter call was skipped because no live integrations were available)"));
  }
  console.log();
  const passedColor = summary.totalVerified >= 0 ? "green" : "red";
  console.log(`  ${paint("bold", "Summary")}`);
  console.log(`    Passed:    ${paint(passedColor, String(summary.totalVerified))}`);
  console.log(`    Failed:    ${paint("red", String(summary.totalFailed))}`);
  console.log(`    Warnings:  ${paint("yellow", String(summary.totalWarnings))}`);
  console.log(`    Verdict:   ${summary.overallAssessment}`);
  console.log();
  console.log(`  ${paint("bold", `Verdicts (${verdicts.length})`)}`);
  for (const v of verdicts) {
    const icon =
      v.status === "pass" ? paint("green", "✓") :
      v.status === "fail" ? paint("red", "✗") :
      paint("yellow", "?");
    const head = `    ${icon} ${paint("bold", v.controlId)} (${v.status})`;
    console.log(head);
    if (v.detail) console.log(paint("dim", `      ${v.detail}`));
    if (v.evidenceSources?.length) {
      console.log(paint("dim", `      via: ${v.evidenceSources.join(", ")}`));
    }
  }
  console.log();
  console.log(`  ${paint("bold", `Gaps needing human input (${gapsNeedingHumanInput.length})`)}`);
  for (const g of gapsNeedingHumanInput) {
    const head = `    ${paint("yellow", "?")} ${paint("bold", g.controlId ?? "general")}`;
    console.log(head);
    console.log(paint("dim", `      ${g.description}`));
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
  const slugs = await pickIntegrations();

  const composio = new Composio({ apiKey: composioKey });

  // connectedCount is hoisted so it's in scope regardless of whether the
  // OAuth loop ran. It is the authoritative signal for the synthesized-stub
  // short-circuit inside runAgentWithSlugs.
  let connectedCount = 0;
  let failedCount = 0;

  if (slugs.length === 0) {
    console.log();
    console.log(paint("dim", "  → No integrations selected — the audit will run as a synthesized all-gaps report."));
  } else {
    console.log();
    console.log(paint("bold", `  Initiating OAuth for ${slugs.length} integration(s)...`));
    for (const slug of slugs) {
      const integ = INTEGRATIONS.find((i) => i.slug === slug);
      const label = integ?.name ?? slug;
      const res = await grantOne(composio, slug, label);
      if (res.ok) connectedCount++;
      else {
        failedCount++;
        console.log(paint("red", `    ✗ Skipping ${label} — ${res.reason}`));
      }
    }
    console.log();
    console.log(
      paint(
        "bold",
        `  OAuth complete: ${paint("green", `${connectedCount} connected`)} · ${paint("red", `${failedCount} skipped`)}`,
      ),
    );
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
