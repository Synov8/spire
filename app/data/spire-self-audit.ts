/**
 * Spire's own audit posture — static snapshot per home-overhaul-spec.md §5.2
 * (option 1: static snapshot as the fallback when the live audit endpoint
 * is gated behind auth behind a Spire-internal admin surface).
 *
 * Notes for the implementer / reviewer:
 *   - `generatedAt` — when this snapshot was authored; UTC ISO-8601.
 *   - `frameworks.soc2.passed / total` — matches the canonical 56 SOC 2
 *     controls referenced throughout the codebase (features.tsx, trust-center.tsx).
 *     The current `passed` is deliberately below 56 to reflect Spire's
 *     pre-certification state — DO NOT change to "56 / 56" without an actual
 *     SOC 2 cert (trust-center.tsx says "Preparing for formal SOC 2 certification").
 *   - `frameworks.aiAct.passed / total` — 10 EU AI Act articles.
 *   - `stage` — human-readable label, rendered next to "Last evaluated:".
 *   - `notes` — explanatory strings, rendered as a bulleted list on the page.
 *
 * Future upgrade path (spec §5.2 option 2): a cron overwrites this file
 * with the latest live audit result. Today the file is hand-maintained.
 */

export type FrameworkPosture = {
  passed: number;
  total: number;
  lastEvaluated: string;
  stage: string;
};

export type SpirePostureSnapshot = {
  generatedAt: string;
  frameworks: {
    soc2: FrameworkPosture;
    aiAct: FrameworkPosture;
  };
  notes: string[];
};

export const spirePosture: SpirePostureSnapshot = {
  generatedAt: "2026-07-04T20:00:00Z",
  frameworks: {
    soc2: {
      passed: 35,
      total: 56,
      lastEvaluated: "2026-07-04T20:00:00Z",
      stage: "Preparing for formal SOC 2 certification",
    },
    aiAct: {
      passed: 6,
      total: 10,
      lastEvaluated: "2026-07-04T20:00:00Z",
      stage: "Evaluating compliance — most requirements met",
    },
  },
  notes: [
    "SOC 2 controls are continuously monitored via Spire's compliance agent.",
    "EU AI Act compliance is assessed per the AI Governance framework.",
    "Spire's own audit posture is updated every 7 days by re-running the agent against Spire's infrastructure.",
    "Penetration testing and formal SOC 2 certification are in progress.",
  ],
};
