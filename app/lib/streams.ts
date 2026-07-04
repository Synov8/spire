import { streams } from "@trigger.dev/sdk";

export type AuditChunk =
  | { type: "tool-call"; id: number; toolName: string; args: unknown }
  | { type: "tool-result"; id: number; result: unknown }
  | { type: "tool-error"; id: number; error: string }
  | { type: "report-submitted" }
  | { type: "error"; message: string };

export const auditStream = streams.define<AuditChunk>({
  id: "audit",
});
