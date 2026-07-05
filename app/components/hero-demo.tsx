/**
 * Hero demo — animated 4-scene loop per home-overhaul-spec.md §4.2 + §7.
 *
 * Scenes (48 s total, ~12 s each — tightened from the spec's 60 s so the
 * Scene 1 → Scene 2 transition feels snappier):
 *   1. Connections  — 14 integrations connecting → connected (staggered)
 *   2. Evidence     — real evidence rows streaming in + counter 0 → 247
 *   3. Questionnaire — 3 questions with AI typewriter answers + confidence bars
 *   4. Export       — audit pack file-list assembly + gradient progress + success
 *
 * Visual design:
 *   • Faux product window chrome (traffic lights + URL bar that changes per scene)
 *   • Subtle dot-grid background for depth
 *   • 4-dot scene progress indicator
 *   • Tinted brand shadow for premium feel
 *   • Directional slide+fade scene transitions (forward progression cue)
 *
 * Behaviour constraints (see spec §10.3):
 *   • `prefers-reduced-motion: reduce` → static scene 1 only, all transitions snapped.
 *   • Viewport < md (mobile) → static scene 1 only.
 *   • Off-screen → pauses rotation (IntersectionObserver).
 *   • Always-visible label "Representative · not live data".
 *   • Scene 1 connecting → connected stagger plays on EVERY mount,
 *     including the first page load (the previous `hasMountedScene1`
 *     SSR-gate that suppressed the stagger on first render was a UX
 *     regression; removed). A <noscript><style> block in HeroDemo
 *     covers the no-JS edge case.
 *
 * Implementation:
 *   • Single active scene mounted at a time via `<AnimatePresence mode="wait">`
 *     keyed by `sceneIdx`. Scene remount on each rotation re-runs internal
 *     timers cleanly.
 *   • Scene 1 stagger runs unconditionally in useEffect; per-row setTimeout
 *     flips row i from connecting → connected at 200 + i * 350 ms.
 *   • useReducedMotion() returns null on SSR; branch is `=== true` only,
 *     so SSR + first client render match.
 *   • Desktop breakpoint and reduced-motion are detected post-mount, so the
 *     initial HTML is identical on server and client.
 *
 * Trademark guard (home-overhaul-spec.md §16) — text-only, no marks.
 */

import { motion, AnimatePresence, useReducedMotion, useAnimate, stagger } from "motion/react";
import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import { INTEGRATION_NAMES } from "~/lib/integration-data";

const SCENE_MS = 2_500;

const SCENE_URLS = [
  "spire.synov8studio.com/connections",
  "spire.synov8studio.com/evidence",
  "spire.synov8studio.com/questionnaires",
  "spire.synov8studio.com/audit-pack",
] as const;

// ─── Scene 1 cap (visual density) ────────────────────────────────────────────
//
// The landing-page hero shows a representative SUBSET of integrations, not all
// of them. With 30+ integrations the staggered connecting→connected animation
// would exceed the 15 s scene rotation window AND each row would compress below
// legible density inside the `aspect-[4/3]` container. We slice the first N
// names — the canonical "headline" integrations that buyers ask about first.
// The full catalog still appears on /integrations, the home trust strip, the
// control explorer filter row, and per-slug landing pages; Scene 1 is a sample.
const HERO_DEMO_INTEGRATION_LIMIT = 14;
const HERO_DEMO_INTEGRATION_NAMES: readonly string[] = Object.freeze(
  INTEGRATION_NAMES.slice(0, HERO_DEMO_INTEGRATION_LIMIT),
);

// ─── Scene 1 stagger (formerly gated by `hasMountedScene1` SSR flag) ─────────
//
// Previous behaviour: a module-level `hasMountedScene1` flag was initialised
// to `false`, captured into a ref on first render, and used to early-return
// from the useEffect timer chain AND skip the motion-library `initial` and
// `transition` props. This meant the first page-load visit saw all
// integrations already "connected" with no spinner animation, and the
// connecting → connected flow only played on ROTATION remounts (after the
// full 60 s loop had run once). That was a UX regression. The flag is
// removed; the stagger now plays on every mount.

// ─── Scene 2 data (real evidence from integration-data.ts) ───────────────────

const EVIDENCE_STREAM: ReadonlyArray<{
  integration: string;
  text: string;
  control: string;
}> = [
  { integration: "GitHub", text: "Commit history", control: "CC8" },
  { integration: "AWS", text: "CloudTrail event history", control: "CC7" },
  { integration: "GitHub", text: "Branch protection", control: "CC6" },
  { integration: "Clerk", text: "MFA enforcement", control: "CC6" },
  { integration: "AWS", text: "IAM user permissions", control: "CC6" },
  { integration: "Cloudflare", text: "WAF rule configuration", control: "CC7" },
  { integration: "Supabase", text: "Encryption at rest", control: "C1" },
  { integration: "Google Workspace", text: "Admin activity reports", control: "CC7" },
];

// ─── Scene 3 data ────────────────────────────────────────────────────────────

const FILL_QUESTIONS = [
  {
    q: "Do you encrypt customer data at rest?",
    a: "Yes — AES-256 at rest, TLS 1.3 in transit. Keys managed via Cloudflare Workers Secrets.",
    confidence: 96,
  },
  {
    q: "Do you require MFA for admin access?",
    a: "Yes — Clerk-authenticated admin sessions require TOTP MFA. Logs captured per CC6.",
    confidence: 88,
  },
  {
    q: "Describe your incident response process.",
    a: "Documented runbook + on-call rotation. Spire commits to acknowledgement within 1 business hour.",
    confidence: 74,
  },
] as const;

const TYPE_MS = 40; // ms per character
const PAUSE_MS = 700; // pause between questions

// ─── Scene 4 data ────────────────────────────────────────────────────────────

const AUDIT_FILES: ReadonlyArray<{ name: string; size: string }> = [
  { name: "SOC2_Control_Matrix.xlsx", size: "1.2 MB" },
  { name: "Evidence_Collection.pdf", size: "3.1 MB" },
  { name: "Audit_Trail.log", size: "0.4 MB" },
  { name: "Trust_Report.docx", size: "0.5 MB" },
];

// ─── Small shared icons ──────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 2h6l4 4v8H3V2z" strokeLinejoin="round" />
      <path d="M9 2v4h4" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Scene 1 (animated) ──────────────────────────────────────────────────────

function Scene1Animated({ onReady }: { onReady?: () => void }) {
  const [connected, setConnected] = useState<boolean[]>(() =>
    Array(HERO_DEMO_INTEGRATION_NAMES.length).fill(false),
  );
  const [scope2, animate2] = useAnimate();
  const s1Ready = useRef(false);

  useEffect(() => {
    // Animate rows appearing
    animate2("li", { opacity: 1, x: 0 }, { delay: stagger(0.06), duration: 0.3 });
    // Stagger the connecting → connected state
    const timers = HERO_DEMO_INTEGRATION_NAMES.map((_, i) =>
      setTimeout(() => {
        setConnected((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 200 + i * 350),
    );
    // Signal ready after last connection completes
    const done = setTimeout(() => { if (!s1Ready.current) { s1Ready.current = true; onReady?.(); } }, 200 + HERO_DEMO_INTEGRATION_NAMES.length * 350);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, []);

  const connectedCount = connected.filter(Boolean).length;

  return (
    <div className="absolute inset-0 flex flex-col p-4">
      {/* Header with pulsing live dot */}
      <div className="flex items-center gap-2">
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]"
        />
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5C5C66]">
          Live integrations
        </span>
      </div>

      {/* Integration rows */}
      <ul className="mt-3 flex-1 space-y-1.5 overflow-y-auto scrollbar-thin">
        {HERO_DEMO_INTEGRATION_NAMES.map((name, i) => {
          const isConn = connected[i];
          return (
            <motion.li
              key={name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-center gap-3 rounded-md px-2 py-1.5"
            >
              {/* Status icon: spinner → checkmark */}
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                {isConn ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CheckIcon className="h-3.5 w-3.5 text-[#00D4AA]" />
                  </motion.span>
                ) : (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#2C2C36] border-t-[#00D4AA]" />
                )}
              </span>

              {/* Name */}
              <span
                className={`text-[13px] transition-colors duration-300 ${
                  isConn ? "text-[#F1F1F3]" : "text-[#5C5C66]"
                }`}
              >
                {name}
              </span>

              {/* Status label */}
              <span
                className={`ml-auto text-[10px] font-medium transition-colors duration-300 ${
                  isConn ? "text-[#00D4AA]" : "text-[#5C5C66]"
                }`}
              >
                {isConn ? "Connected" : "Connecting\u2026"}
              </span>
            </motion.li>
          );
        })}
      </ul>

      {/* Footer summary */}
      <div className="mt-auto pt-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-mono text-[#5C5C66]">{connectedCount}/{HERO_DEMO_INTEGRATION_NAMES.length} connected</span>
          <span className="text-[#5C5C66]">Read-only</span>
        </div>
      </div>
    </div>
  );
}

// ─── Scene 1 (static) — reduced-motion / mobile fallback ─────────────────────

function Scene1Static() {
  return (
    <div className="absolute inset-0 flex flex-col p-4">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5C5C66]">
          Live integrations
        </span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {HERO_DEMO_INTEGRATION_NAMES.map((name) => (
          <li key={name} className="flex items-center gap-3 rounded-md px-2 py-1.5">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
              <CheckIcon className="h-3.5 w-3.5 text-[#00D4AA]" />
            </span>
            <span className="text-[13px] text-[#F1F1F3]">{name}</span>
            <span className="ml-auto text-[10px] font-medium text-[#00D4AA]">Connected</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-mono text-[#5C5C66]">{HERO_DEMO_INTEGRATION_NAMES.length}/{HERO_DEMO_INTEGRATION_NAMES.length} connected</span>
          <span className="text-[#5C5C66]">Read-only</span>
        </div>
      </div>
    </div>
  );
}

// ─── Scene 2: Evidence streaming ─────────────────────────────────────────────

function Scene2Evidence({ onReady }: { onReady?: () => void }) {
  const [displayCount, setDisplayCount] = useState(0);
  const [scope, animate] = useAnimate();
  const totalEvidence = 247;
  const ready = useRef(false);
  const count = EVIDENCE_STREAM.length;

  useEffect(() => {
    const step = totalEvidence / (count + 2);
    const timers = Array.from({ length: count }, (_, i) =>
      setTimeout(() => setDisplayCount(Math.round(step * (i + 2))), (i + 1) * 700)
    );
    timers.push(setTimeout(() => setDisplayCount(totalEvidence), (count + 1) * 700));
    animate("li", { opacity: 1, x: 0 }, { delay: stagger(0.7), duration: 0.3 })
      .then(() => { if (!ready.current) { ready.current = true; onReady?.(); } });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5C5C66]">Evidence collection</span>
        <span className="flex items-center gap-1 text-[9px] text-[#5C5C66]">
          <span className="h-1 w-1 animate-pulse rounded-full bg-[#00D4AA]" />Auto-collecting
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <motion.span key={displayCount} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-lg font-bold tabular-nums text-[#F1F1F3]">{displayCount}</motion.span>
        <span className="text-[10px] text-[#8B8B93]">evidence items</span>
      </div>
      <ul ref={scope} className="mt-3 flex-1 space-y-1.5 overflow-y-auto scrollbar-thin">
        {EVIDENCE_STREAM.map((item) => (
          <li key={`${item.integration}-${item.text}`}
            className="flex items-center gap-1.5 rounded-md border border-[#1C1C24] bg-[#0E0E14] px-2 py-1.5 opacity-0 -translate-x-2 min-w-0"
          >
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-[#00D4AA]/10 text-[7px] font-bold text-[#00D4AA]">{item.integration[0]}</span>
            <span className="min-w-0 flex-1 truncate text-[10px] text-[#B0B0B8]">{item.text}</span>
            <span className="shrink-0 rounded bg-[#00D4AA]/10 px-1 py-0.5 font-mono text-[8px] text-[#00D4AA]">{item.control}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-auto pt-2">
        <p className="text-[9px] text-[#5C5C66]">Auto-collected from live systems · 24/7</p>
      </div>
    </div>
  );
}

// ─── Scene 3: Questionnaire with typewriter ──────────────────────────────────

function Scene3Questionnaire({ onReady }: { onReady?: () => void }) {
  const s3Ready = useRef(false);
  useEffect(() => {
    const totalMs = FILL_QUESTIONS.reduce((sum, q) => sum + q.a.length * TYPE_MS + PAUSE_MS, 0);
    const id = setTimeout(() => { if (!s3Ready.current) { s3Ready.current = true; onReady?.(); } }, totalMs);
    return () => clearTimeout(id);
  }, []);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => {
      setTick(Date.now() - startedAt);
    }, TYPE_MS);
    return () => clearInterval(id);
  }, []);

  // Compute typing state from elapsed time
  let elapsed = tick;
  let activeIdx = -1;
  let typedLen = 0;

  for (let i = 0; i < FILL_QUESTIONS.length; i++) {
    const ansLen = FILL_QUESTIONS[i].a.length;
    const typeDur = ansLen * TYPE_MS;
    if (elapsed < typeDur) {
      activeIdx = i;
      typedLen = Math.floor(elapsed / TYPE_MS);
      break;
    }
    elapsed -= typeDur;
    if (elapsed < PAUSE_MS) {
      activeIdx = i;
      typedLen = ansLen;
      break;
    }
    elapsed -= PAUSE_MS;
  }
  if (activeIdx === -1) {
    activeIdx = FILL_QUESTIONS.length - 1;
    typedLen = FILL_QUESTIONS[FILL_QUESTIONS.length - 1].a.length;
  }

  return (
    <div className="absolute inset-0 flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5C5C66]">
          Questionnaire autofill
        </span>
        <span className="text-[9px] text-[#5C5C66]">AI-generated</span>
      </div>

      {/* Question cards */}
      <div className="mt-3 flex-1 space-y-2">
        {FILL_QUESTIONS.map((row, i) => {
          const isActive = i === activeIdx;
          const isDone =
            i < activeIdx || (i === activeIdx && typedLen >= row.a.length);
          const typedText =
            i < activeIdx
              ? row.a
              : i === activeIdx
                ? row.a.slice(0, typedLen)
                : "";

          return (
            <div
              key={i}
              className={`rounded-lg border p-2.5 transition-colors duration-300 ${
                isActive && !isDone
                  ? "border-[#00D4AA]/30 bg-[#00D4AA]/[0.03]"
                  : "border-[#1C1C24] bg-[#0E0E14]"
              }`}
            >
              <p className="text-[11px] font-medium text-[#F1F1F3]">{row.q}</p>
              {typedText && (
                <p className="mt-1 text-[10px] leading-relaxed text-[#8B8B93]">
                  <span className="border-r border-[#00D4AA]/60 pr-0.5">{typedText}</span>
                  {isActive && !isDone && (
                    <motion.span
                      aria-hidden="true"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="ml-0.5 inline-block h-2.5 w-[2px] -mb-0.5 bg-[#00D4AA]"
                    />
                  )}
                </p>
              )}
              {isDone && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mt-1.5 flex items-center gap-2"
                >
                  {/* Confidence bar */}
                  <div className="h-1 w-14 overflow-hidden rounded-full bg-[#1C1C24]">
                    <motion.div
                      className="h-full rounded-full bg-[#00D4AA]"
                      initial={{ width: 0 }}
                      animate={{ width: `${row.confidence}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="font-mono text-[8.5px] text-[#00D4AA]">
                    {row.confidence}%
                  </span>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-2">
        <p className="text-[9px] text-[#5C5C66]">AI-generated · human review required</p>
      </div>
    </div>
  );
}

// ─── Scene 4: Audit pack file-list assembly ──────────────────────────────────

function Scene4Export({ onReady }: { onReady?: () => void }) {
  const s4Ready = useRef(false);
  useEffect(() => {
    const id = setTimeout(() => { if (!s4Ready.current) { s4Ready.current = true; onReady?.(); } }, 7_500);
    return () => clearTimeout(id);
  }, []);
  const [assembledCount, setAssembledCount] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Files appear one by one
    const fileInterval = 1_500; // ms between files
    const fileTimers = AUDIT_FILES.map((_, i) =>
      setTimeout(() => setAssembledCount(i + 1), 500 + i * fileInterval),
    );

    // Progress bar fills continuously. Tightened from 14 s to 11 s so
    // the bar reaches 100 % before the 12 s SCENE_MS rotation.
    const startedAt = Date.now();
    const progressId = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(elapsed / 7_000, 1);
      setProgress(Math.round(pct * 100));
    }, 60);

    return () => {
      fileTimers.forEach(clearTimeout);
      clearInterval(progressId);
    };
  }, []);

  const done = progress >= 100;

  return (
    <div className="absolute inset-0 flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5C5C66]">
          Audit pack export
        </span>
        {done && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-1 text-[9px] font-medium text-[#00D4AA]"
          >
            <CheckIcon className="h-3 w-3" />
            Ready
          </motion.span>
        )}
      </div>

      {/* File list */}
      <div className="mt-3 flex-1 space-y-1.5">
        {AUDIT_FILES.map((file, i) => {
          const isAssembled = i < assembledCount;
          return (
            <AnimatePresence key={file.name}>
              {isAssembled && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-2.5 rounded-md border border-[#1C1C24] bg-[#0E0E14] px-2.5 py-2"
                >
                  <FileIcon className="h-4 w-4 shrink-0 text-[#5C5C66]" />
                  <span className="flex-1 truncate text-[11px] text-[#B0B0B8]">
                    {file.name}
                  </span>
                  <span className="font-mono text-[9px] text-[#5C5C66]">{file.size}</span>
                  <CheckIcon className="h-3 w-3 shrink-0 text-[#00D4AA]" />
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1C1C24]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(to right, #00D4AA, #00B894)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[9px]">
          <span className="font-mono text-[#5C5C66]">{progress}%</span>
          <span className="font-mono text-[#5C5C66]">
            {done ? "5.2 MB total" : "Assembling\u2026"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Scene registry ──────────────────────────────────────────────────────────

const SCENE_RENDERERS = [
  Scene1Animated,
  Scene2Evidence,
  Scene3Questionnaire,
  Scene4Export,
] as const;

// ─── Demo frame (shared window chrome) ───────────────────────────────────────

const DemoFrame = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    sceneIdx: number;
    showProgress: boolean;
    ariaLabel?: string;
  }
>(function DemoFrame({ children, sceneIdx, showProgress, ariaLabel }, ref) {
  return (
    <div
      ref={ref}
      className="relative flex aspect-[4/3] w-full flex-col overflow-hidden rounded-2xl border border-[#1C1C24] bg-[#0A0A0C] shadow-[0_20px_70px_-15px_rgba(0,212,170,0.12)]"
      aria-label={ariaLabel}
    >
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle, #2C2C36 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Window chrome */}
      <div className="relative z-10 flex shrink-0 items-center gap-2 border-b border-[#1C1C24] bg-[#0E0E14]/90 px-3.5 py-2.5">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2C2C36]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2C2C36]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2C2C36]" />
        </div>
        {/* Faux URL bar */}
        <div className="ml-1.5 flex-1 rounded-md bg-[#1C1C24] px-2 py-0.5">
          <span className="font-mono text-[9.5px] text-[#5C5C66]">
            {SCENE_URLS[sceneIdx]}
          </span>
        </div>
        {/* Honesty label */}
        <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.08em] text-[#5C5C66]">
          Representative · not live data
        </span>
      </div>

      {/* Scene content */}
      <div className="relative z-10 flex-1 overflow-hidden">
        {children}
      </div>

      {/* Scene progress dots */}
      {showProgress && (
        <div className="absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
          {SCENE_RENDERERS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === sceneIdx ? "w-4 bg-[#00D4AA]" : "w-1.5 bg-[#2C2C36]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ─── HeroDemo ────────────────────────────────────────────────────────────────

export function HeroDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion(); // null on SSR, true/false client-side
  const isStatic = reducedMotion === true;

  const [isDesktop, setIsDesktop] = useState(true); // SSR defaults match static path
  const [inView, setInView] = useState(true);
  const [sceneIdx, setSceneIdx] = useState(0);

  // Desktop breakpoint (≥ md = 768 px).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Pause when off-screen.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || isStatic || !isDesktop) return;
    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isStatic, isDesktop]);

  // Scene rotation — only on desktop, motion-OK, AND in viewport.
  // Uses onAnimationComplete from AnimatePresence to sync with stagger completion.
  const [sceneReady, setSceneReady] = useState(false);
  useEffect(() => {
    if (isStatic || !isDesktop || !inView) return;
    if (!sceneReady) return;
    const id = setTimeout(() => {
      setSceneReady(false);
      setSceneIdx((i) => (i + 1) % SCENE_RENDERERS.length);
    }, SCENE_MS);
    return () => clearTimeout(id);
  }, [isStatic, isDesktop, inView, sceneReady]);

  // Mark first scene ready immediately on mount, subsequent ones after stagger
  useEffect(() => {
    if (sceneIdx === 0) setSceneReady(true);
  }, [sceneIdx]);

  // No-JS fallback: a small inline stylesheet inside <noscript> overrides
  // motion library's inline `opacity: 0` / `transform` styles so the
  // hero integration rows are visible without scripting. Targeting via
  // the `.hero-scene-1` class on this wrapper is more specific than
  // motion library's class generation. JS-enabled browsers render this
  // only as a <noscript> tag (its contents are hidden by browser
  // default), so there's zero visual cost on the script-enabled path.
  const noJsFallback = (
    <noscript>
      <style>{`
        .hero-scene-1 li { opacity: 1 !important; transform: none !important; }
      `}</style>
    </noscript>
  );

  // Reduced-motion OR mobile → static scene 1 only.
  if (isStatic || !isDesktop) {
    return (
      <div className="hero-scene-1">
        {noJsFallback}
        <DemoFrame sceneIdx={0} showProgress={false} ariaLabel="Product demo (static preview)">
          <Scene1Static />
        </DemoFrame>
      </div>
    );
  }

  const Renderer = SCENE_RENDERERS[sceneIdx];

  return (
    <div className="hero-scene-1">
      {noJsFallback}
      <DemoFrame
        ref={containerRef}
        sceneIdx={sceneIdx}
        showProgress
        ariaLabel="Animated product demo (48-second loop)"
      >
      <AnimatePresence mode="wait">
        <motion.div
          key={sceneIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-x-0 top-0 bottom-6"
        >
          <Renderer onReady={() => setSceneReady(true)} />
        </motion.div>
      </AnimatePresence>
      </DemoFrame>
    </div>
  );
}
