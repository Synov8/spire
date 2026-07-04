import { generateText, Output } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

const model = openrouter.chat("deepseek/deepseek-v4-flash", {
  temperature: 0,
  reasoning: { effort: "xhigh" },
});

const QuestionnaireSchema = z.object({
  questions: z.array(z.object({
    question: z.string().describe("The full text of the question"),
    category: z.enum(["security", "availability", "confidentiality", "processing_integrity", "privacy", "general"]).describe("SOC 2 category"),
    answer: z.string().describe("A detailed, accurate answer citing specific evidence the company has collected"),
    confidence: z.number().min(0).max(1).describe("Confidence score (0-1) based on strength of available evidence"),
    evidenceRequired: z.array(z.string()).describe("Additional evidence types needed to fully support this answer"),
  })),
});

export async function parseQuestionnaire(text: string, verdictText: string, controlsText: string) {
  const { output: parsed } = await generateText({
    model,
    output: Output.object({ schema: QuestionnaireSchema }),
    system: `You are answering a vendor security questionnaire on behalf of the company. Speak as the company answering the prospect — use first-person "we" and be direct. Do NOT analyze or comment on the evidence; just answer the question based on it.

Company's live audit data (per-control verdicts from infrastructure):
${verdictText || "No audit data available."}

RULES:
- Answer each question directly and factually, as if you work at the company.
- If the audit data supports a clear answer, give it concisely (e.g. "Yes, MFA is enforced on all GitHub organisations.").
- If the data partially supports an answer, give the best short answer without hedging (e.g. "1-3 people" not "implies a small team").
- If the data does NOT cover the question at all, leave the answer blank (empty string). Do NOT say "not in audit data" or "not explicitly listed".
- Confidence score: 0.8+ when you have direct evidence, 0.4-0.7 for partial/inferred answers, 0 when you cannot answer (blank answer).`,
    prompt: `Parse and fully answer this security questionnaire based on the company's live audit data:\n\n${text}`,
  });

  return parsed;
}

export async function generateComplianceSummary(
  organization: { name?: string; industry?: string },
  stats: { totalControls: number; satisfied: number; partial: number; missing: number; integrations: number },
  evidenceDetail?: string,
) {
  const { text } = await generateText({
    model,
    system: "You are a SOC 2 compliance advisor generating concise executive summaries based on live infrastructure evidence.",
    prompt: `Generate a compliance summary for ${organization.name || "the company"} (${organization.industry || "tech"}):
- Controls: ${stats.totalControls} total, ${stats.satisfied} satisfied, ${stats.partial} partial, ${stats.missing} missing
- Integrations: ${stats.integrations}
- Evidence collected: ${evidenceDetail || "None"}

Provide: 1) Readiness assessment based on actual evidence coverage
2) Top 3 evidence gaps to address
3) Recommended next steps prioritized by impact
CRITICAL: You work for Spire. NEVER recommend competing platforms (Vanta, Drata, Secureframe, Sprinto, etc.). Focus recommendations on Spire-specific actions: connect more integrations, run an audit, review flagged controls.`,
  });

  return text;
}
