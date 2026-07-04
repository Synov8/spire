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

// ─── App colours ───
const APP_COLOURS: Record<string, string> = {
  GitHub: "bg-[#2DBA4E]/10 text-[#2DBA4E] border-[#2DBA4E]/20",
  Stripe: "bg-[#635BFF]/10 text-[#7C73FF] border-[#635BFF]/20",
  Notion: "bg-white/10 text-white border-white/20",
  Cloudflare: "bg-[#F38020]/10 text-[#F38020] border-[#F38020]/20",
  Neon: "bg-[#00E599]/10 text-[#00E599] border-[#00E599]/20",
  Resend: "bg-[#FF6C2C]/10 text-[#FF6C2C] border-[#FF6C2C]/20",
  Gmail: "bg-[#EA4335]/10 text-[#EA4335] border-[#EA4335]/20",
  Discord: "bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/20",
  Slack: "bg-[#4A154B]/10 text-[#E01E5A] border-[#E01E5A]/20",
  Google: "bg-[#4285F4]/10 text-[#4285F4] border-[#4285F4]/20",
  AWS: "bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20",
  Vercel: "bg-[#FFFFFF]/10 text-[#FFFFFF] border-[#FFFFFF]/20",
  Jira: "bg-[#0052CC]/10 text-[#2684FF] border-[#0052CC]/20",
  Linear: "bg-[#5E6AD2]/10 text-[#5E6AD2] border-[#5E6AD2]/20",
  Sentry: "bg-[#FB4226]/10 text-[#FB4226] border-[#FB4226]/20",
  Datadog: "bg-[#632CA6]/10 text-[#632CA6] border-[#632CA6]/20",
  Figma: "bg-[#F24E1E]/10 text-[#F24E1E] border-[#F24E1E]/20",
  OpenAI: "bg-[#74AA9C]/10 text-[#74AA9C] border-[#74AA9C]/20",
};

function appColour(app: string): string {
  return APP_COLOURS[app] || "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20";
}

function AppBadge({ app }: { app: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none ${appColour(app)}`}>
      {app}
    </span>
  );
}

// ─── Tool name parsing (moved from trigger/audit-task.ts) ───

const APP_LABELS: Record<string, string> = {
  github: "GitHub", stripe: "Stripe", notion: "Notion",
  cloudflare: "Cloudflare", neon: "Neon", resend: "Resend",
  gmail: "Gmail", discord: "Discord", slack: "Slack",
  jira: "Jira", linear: "Linear", figma: "Figma",
  sentry: "Sentry", datadog: "Datadog", aws: "AWS",
  vercel: "Vercel", google: "Google", openai: "OpenAI",
};

function describeComposioTool(toolName: string, args: any): { app: string; action: string; description: string; progress?: string } {
  const lower = toolName.toLowerCase();

  if (lower === "composio_manage_connections") {
    const toolkits: string[] = args?.toolkits ?? [];
    const apps = toolkits.map((t: string) => APP_LABELS[t.toLowerCase()] || t.charAt(0).toUpperCase() + t.slice(1));
    return { app: apps.join(", "), action: "Checking connections…", description: `Verifying ${apps.length} integration connections` };
  }

  if (lower === "composio_search_tools") {
    const queries: Array<{ use_case?: string }> = args?.queries ?? [];
    if (queries.length === 1 && queries[0].use_case?.startsWith("list all available")) {
      return { app: "Composio", action: "Discovering available tools…", description: "" };
    }
    const apps = new Set<string>();
    for (const q of queries) {
      const match = q.use_case?.match(/for (\w+)/);
      if (match) apps.add(APP_LABELS[match[1].toLowerCase()] || match[1]);
    }
    return { app: [...apps].join(", ") || "Composio", action: "Finding relevant tools…", description: `${queries.length} queries` };
  }

  if (lower === "composio_get_tool_schemas") {
    const slugs: string[] = args?.tool_slugs ?? [];
    const apps = slugs.map(slugApp);
    const unique = [...new Set(apps)];
    return { app: unique.join(", ") || "Composio", action: "Loading tool schemas…", description: `${slugs.length} tools` };
  }

  if (lower === "composio_multi_execute_tool") {
    const tools: Array<{ tool_slug?: string; arguments?: Record<string, unknown> }> = args?.tools ?? [];
    const thought: string = args?.thought ?? "";
    const metric: string = args?.current_step_metric ?? "";
    const apps = [...new Set(tools.map((t) => slugApp(t.tool_slug || "")))];
    const short = thought ? (thought.length > 60 ? thought.slice(0, 60) + "…" : thought) : `Probing ${apps.length} apps`;
    return { app: apps.join(", "), action: short, description: `${tools.length} tools • ${metric}`, progress: metric };
  }

  if (lower === "composio_remote_workbench") {
    const thought: string = args?.thought ?? "";
    const metric: string = args?.current_step_metric ?? "";
    return { app: "Composio", action: thought || "Processing evidence…", description: metric || "" };
  }

  return { app: "Composio", action: "Running audit checks…", description: "" };
}

function slugApp(slug: string): string {
  if (!slug) return "";
  const prefix = slug.split("_")[0]?.toLowerCase();
  return APP_LABELS[prefix] || prefix?.toUpperCase() || slug;
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
  app: string;
  action: string;
  description: string;
  progress?: string;
  toolName?: string;
  args?: unknown;
  result?: unknown;
}

// ─── Individual tool-call card ───
function ToolCallCard({ card }: { card: ToolCard }) {
  if (card.type === "report-submitted") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[#00D4AA]/20 bg-[#00D4AA]/5 px-4 py-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00D4AA]">
          <svg className="h-3 w-3 text-black" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4l3 3 5-5" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-medium text-[#F1F1F3]">Audit report submitted</p>
          <p className="text-xs text-[#5C5C66]">Results saved to your compliance dashboard</p>
        </div>
      </div>
    );
  }

  const hasResult = card.result !== undefined;
  const resultPreview = hasResult
    ? JSON.stringify(card.result).slice(0, 300)
    : null;

  return (
    <div className="rounded-xl border border-[#1A1D1E] bg-[#0B0D0E] px-4 py-3 transition-all duration-300">
      <div className="flex items-start gap-3">
        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${hasResult ? "bg-[#00D4AA]" : "bg-[#00D4AA] animate-pulse"}`} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {card.app && <AppBadge app={card.app} />}
            {!card.app && card.toolName && (
              <span className="inline-flex items-center gap-1 rounded-md border border-[#5C5C66]/30 bg-[#5C5C66]/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-[#5C5C66]">
                {card.toolName}
              </span>
            )}
            <p className="text-xs font-medium text-[#F1F1F3]">{card.action}</p>
          </div>

          {card.description && (
            <p className="mt-1 text-[11px] text-[#6A6D6E] leading-relaxed">{card.description}</p>
          )}

          {card.progress && (
            <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#5C5C66]">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#1A1D1E]">
                <div className="h-full animate-pulse rounded-full bg-[#00D4AA]" style={{ width: "30%" }} />
              </div>
              <span className="shrink-0">{card.progress}</span>
            </div>
          )}

          {hasResult && resultPreview && (
            <div className="mt-2">
              <details>
                <summary className="cursor-pointer text-[10px] text-[#5C5C66] hover:text-[#8B8B93]">Result</summary>
                <pre className="mt-1 overflow-x-auto rounded-lg border border-[#1A1D1E] bg-[#07080A] p-2 text-[10px] font-mono text-[#8B8B93] leading-relaxed">
                  {resultPreview}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
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
          app: entry.app,
          action: entry.action,
          description: entry.description,
          progress: (entry as any).progress,
          toolName: p.toolName,
          args: p.args,
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
      cards.push({ id: 0, type: "report-submitted", app: "", action: "", description: "" });
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

      {isRunning && (
        <div className="relative h-0.5 shrink-0 bg-[#1A1D1E]">
          <div className="absolute inset-y-0 left-0 w-1/3 animate-pulse rounded-r-full bg-[#00D4AA]" />
        </div>
      )}
    </div>
  );
}
