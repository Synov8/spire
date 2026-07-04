import { useRef, useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router";
import { useRealtimeRunsWithTag, useRealtimeStream } from "@trigger.dev/react-hooks";
import { auth } from "~/lib/auth.server";
import type { AuditChunk } from "~/lib/streams";
import type { Route } from "./+types/dashboard.audit";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  const orgId = session?.session.activeOrganizationId;
  let accessToken: string | null = null;
  if (orgId) {
    try {
      const { auth: triggerAuth } = await import("@trigger.dev/sdk");
      accessToken = await triggerAuth.createPublicToken({ scopes: { read: { tags: [`audit:${orgId}`] } } });
    } catch { /* trigger not available */ }
  }
  return { orgId, accessToken };
}

const APP_NAMES = new Set([
  "GitHub", "Stripe", "Notion", "Cloudflare", "Neon", "Resend",
  "Gmail", "Discord", "Slack", "Jira", "Linear", "Figma",
  "Sentry", "Datadog", "AWS", "Vercel", "Google", "OpenAI",
]);

function highlightApps(text: string): (string | { app: string })[] {
  const parts: (string | { app: string })[] = [];
  const re = /(\w+)/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const word = m[1];
    if (APP_NAMES.has(word)) {
      parts.push({ app: word });
    } else {
      parts.push(word);
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ─── Tool name parsing ───

const APP_LABELS: Record<string, string> = {
  github: "GitHub", stripe: "Stripe", notion: "Notion",
  cloudflare: "Cloudflare", neon: "Neon", resend: "Resend",
  gmail: "Gmail", discord: "Discord", slack: "Slack",
  jira: "Jira", linear: "Linear", figma: "Figma",
  sentry: "Sentry", datadog: "Datadog", aws: "AWS",
  vercel: "Vercel", google: "Google", openai: "OpenAI",
};

function describeComposioTool(toolName: string, args: any): { app: string; action: string; description: string } {
  const lower = toolName.toLowerCase();

  if (lower === "composio_manage_connections") {
    return { app: "", action: "Checking connections…", description: "" };
  }

  if (lower === "composio_search_tools") {
    return { app: "", action: "Finding relevant tools…", description: "" };
  }

  if (lower === "composio_get_tool_schemas") {
    return { app: "", action: "Loading tool schemas…", description: "" };
  }

  if (lower === "composio_multi_execute_tool") {
    const thought: string = args?.thought ?? "";
    return { app: "", action: thought || "Gathering evidence…", description: "" };
  }

  if (lower === "composio_remote_workbench") {
    return { app: "", action: "Processing evidence…", description: "" };
  }

  return { app: "", action: "Running audit checks…", description: "" };
}

function describeAction(actionName: string, args: Record<string, unknown>): string {
  const v = (k: string) => (args[k] != null ? String(args[k]) : null);
  const owner = v("owner") || v("org") || v("organization");
  const repo = v("repo") || v("repository");
  const query = v("q") || v("query") || v("search");
  const name = v("name") || v("username");
  const id = v("id") || v("issue") || v("pr");

  const lowered = actionName.toLowerCase();

  if (lowered.startsWith("list")) {
    const target = actionName.replace(/^list_?/i, "").replace(/_/g, " ") || "data";
    if (owner) return `Browsing ${target} in ${owner}${repo ? `/${repo}` : ""}`;
    return `Looking up ${target}`;
  }
  if (lowered.startsWith("search")) {
    return query ? `Searching for "${query}"` : "Searching";
  }
  if (lowered.startsWith("get") || lowered.startsWith("retrieve") || lowered.startsWith("fetch")) {
    const target = actionName.replace(/^(get|retrieve|fetch)_?/i, "").replace(/_/g, " ") || "details";
    const what = id || repo || name || owner || "";
    return `Reading ${target} ${what}`.trim();
  }
  if (lowered.startsWith("create") || lowered.startsWith("add")) {
    return `Creating ${actionName.replace(/^(create|add)_?/i, "").replace(/_/g, " ")}`.trim();
  }
  if (lowered.includes("member") || lowered.includes("user")) return "Checking team members";
  if (lowered.includes("issue") || lowered.includes("ticket")) return `Checking issues${id ? ` #${id}` : ""}`;
  if (lowered.includes("commit") || lowered.includes("pull") || lowered.includes("merge")) return "Inspecting code changes";

  return actionName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function describeToolCall(toolName: string, args: Record<string, unknown>): { app: string; action: string; description: string }[] {
  const lower = toolName.toLowerCase();
  if (lower.startsWith("composio_")) {
    return [describeComposioTool(toolName, args)];
  }
  if (lower === "submitauditreport") return [{ app: "", action: "Submitting audit report…", description: "" }];
  const parts = toolName.split("_");
  const prefix = parts[0] || "";
  const app = APP_LABELS[prefix] || prefix.charAt(0).toUpperCase() + prefix.slice(1);
  const verb = parts.slice(1).join("_");
  return [{ app, action: describeAction(verb, args), description: "" }];
}

// ─── Internal card type with parsed display info ───

interface ToolCard {
  id: number;
  type: "tool-call" | "report-submitted";
  action: string;
  toolName?: string;
  result?: unknown;
}

// ─── Individual tool-call card ───
function ToolCallCard({ card }: { card: ToolCard }) {
  if (card.type === "report-submitted") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[#00D4AA]/20 bg-[#00D4AA]/5 px-3 py-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00D4AA]">
          <svg className="h-2.5 w-2.5 text-black" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4l3 3 5-5" /></svg>
        </span>
        <p className="text-xs font-medium text-[#F1F1F3]">Audit report submitted</p>
      </div>
    );
  }

  const hasResult = card.result !== undefined;

  return (
    <div className={`flex items-center gap-2 rounded-lg border border-[#1A1D1E] px-3 py-2 ${hasResult ? "" : "border-l-2 border-l-[#00D4AA]"}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${hasResult ? "bg-[#5C5C66]" : "bg-[#00D4AA] animate-pulse"}`} />
      <p className="min-w-0 flex-1 text-xs text-[#8B8B93]">
        {highlightApps(card.action).map((p, i) =>
          typeof p === "string" ? <span key={i}>{p}</span> : <span key={i} className="rounded bg-[#00D4AA]/10 px-1 py-0.5 font-mono text-[10px] font-semibold text-[#00D4AA]">{p.app}</span>
        )}
      </p>
    </div>
  );
}

// ─── Group stream parts into tool-call cards ───
function buildCards(parts: unknown[]): ToolCard[] {
  const cards: ToolCard[] = [];
  const pending = new Map<number, number>();

  for (const part of parts) {
    const p: AuditChunk = typeof part === "string" ? JSON.parse(part) : part;

    if (p.type === "tool-call") {
      const id = p.id;
      const entries = describeToolCall(p.toolName, (p.args ?? {}) as Record<string, unknown>);
      for (const entry of entries) {
        pending.set(1, cards.length);
        cards.push({
          id,
          type: "tool-call",
          action: entry.action,
          toolName: p.toolName,
        });
      }
    } else if (p.type === "tool-result") {
      const id = p.id;
      for (let i = cards.length - 1; i >= 0; i--) {
        if (cards[i].type === "tool-call" && cards[i].id === id) {
          cards[i] = { ...cards[i], result: p.result };
          break;
        }
      }
      pending.delete(1);
    } else if (p.type === "tool-error") {
      pending.delete(1);
    } else if (p.type === "report-submitted") {
      cards.push({ id: 0, type: "report-submitted", action: "" });
    }
  }

  return cards;
}

export default function AuditPage() {
  const { orgId, accessToken } = useLoaderData() as { orgId: string | null | undefined; accessToken: string | null };
  const mainRef = useRef<HTMLDivElement>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const { runs } = useRealtimeRunsWithTag(orgId ? `audit:${orgId}` : "", {
    accessToken: accessToken || undefined,
    enabled: !!orgId && !!accessToken,
  });
  useEffect(() => {
    if (runs && runs.length > 0 && !runId) {
      const active = runs.find((r: any) => ["QUEUED", "EXECUTING", "WAITING"].includes(r.status));
      if (active) setRunId(active.id);
    }
  }, [runs, runId]);

  const { parts, error } = useRealtimeStream(runId ?? "", "audit", {
    accessToken: accessToken || undefined,
    enabled: !!runId && !!accessToken,
    timeoutInSeconds: 600,
  });

  const cards = buildCards(parts ?? []);
  const hasReport = cards.some((c) => c.type === "report-submitted");
  const runningToolCount = cards.filter((c) => c.type === "tool-call" && c.result === undefined).length;
  const isRunning = !hasReport && runningToolCount > 0;

  if (!runId && !runs?.length) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#5C5C66]">No audit running.</p>
          <Link to="/dashboard" className="mt-2 inline-block text-sm text-[#00D4AA] hover:underline">Back to overview</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#0B0D0E]">
      <header className="flex shrink-0 items-center justify-between border-b border-[#1A1D1E] px-5 py-3">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5C5C66] transition-colors hover:bg-[#1A1D1E] hover:text-[#F1F1F3]">
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10 4l-4 4 4 4" />
            </svg>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className={`h-2 w-2 rounded-full ${hasReport ? "bg-[#00D4AA]" : isRunning ? "bg-[#00D4AA] animate-pulse" : "bg-[#5C5C66]"}`} />
            <h1 className="text-sm font-medium text-[#F1F1F3]">
              {hasReport ? "Audit complete" : isRunning ? "Running compliance audit" : "Initialising…"}
            </h1>
          </div>
          <span className="text-xs text-[#5C5C66]">{cards.length} steps</span>
        </div>
        <div className="flex items-center gap-4">
          {hasReport && (
            <Link to="/dashboard" className="rounded-lg bg-[#00D4AA] px-3.5 py-1.5 text-xs font-medium text-black transition-colors hover:bg-[#00B894]">
              View results
            </Link>
          )}
        </div>
      </header>

      <div ref={mainRef} className="flex-1 overflow-y-auto px-6 py-5">
        {error && (
          <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/[0.04] px-4 py-3">
            <p className="text-sm text-[#EF4444]">Connection error: {String(error)}</p>
          </div>
        )}

        {!parts && !error && (
          <div className="flex items-center gap-3 rounded-xl border border-[#1A1D1E] bg-[#0B0D0E] px-4 py-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#00D4AA]" />
            <p className="text-sm text-[#6A6D6E]">Connecting to audit stream…</p>
          </div>
        )}

        {cards.length === 0 && parts && !error && (
          <div className="flex items-center gap-3 rounded-xl border border-[#1A1D1E] bg-[#0B0D0E] px-4 py-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#00D4AA]" />
            <p className="text-sm text-[#6A6D6E]">Audit agent is starting…</p>
          </div>
        )}

        <div className="space-y-3">
          {cards.map((card, i) => (
            <ToolCallCard key={i} card={card} />
          ))}
        </div>
      </div>

    </div>
  );
}
