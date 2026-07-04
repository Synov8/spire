import { task } from "@trigger.dev/sdk";
import { generateText, Output } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });
const model = openrouter.chat("deepseek/deepseek-v4-flash", {
  temperature: 0,
  reasoning: { effort: "xhigh" },
});

const ResultSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    confidence: z.number().min(0).max(1),
  })),
});

export const processQuestionnaire = task({
  id: "process-questionnaire",
  run: async (payload: { orgId: string; questionnaireId: string; rawText: string; verdictText: string }) => {
    const { orgId, questionnaireId, rawText, verdictText } = payload;
    const sql = neon(process.env.DATABASE_URL!);

    const composio = new Composio({
      provider: new VercelProvider(),
      apiKey: process.env.COMPOSIO_API_KEY!,
    });

    let questions: Array<{ question: string; answer: string; confidence: number }> = [];
    try {
      let session, tools;
      try {
        session = await composio.create(orgId);
        tools = await session.tools();
      } catch {
        tools = {} as any;
      }

      const result = await generateText({
        model,
        tools,
        system: [
          `You are a compliance investigator at Spire. You have live access to the company's connected apps via Composio tools.`,
          ``,
          `Existing audit data from the latest infrastructure audit:`,
          verdictText || "No audit data available.",
          ``,
          `INSTRUCTIONS:`,
          `1. Parse each question from the uploaded security questionnaire.`,
          `2. For each question, use Composio tools to probe connected apps (GitHub, Stripe, Neon, Cloudflare, etc.) for relevant evidence.`,
          `3. Cross-reference the existing audit data above.`,
          `4. Answer directly as the company — use "we" and be concise.`,
          `5. If evidence supports a clear answer, give it (e.g. "Yes, MFA is enforced on all GitHub orgs.").`,
          `6. If evidence partially supports an answer, give the best short answer without hedging.`,
          `7. If no evidence covers the question, leave answer blank (empty string).`,
          `8. Confidence: 0.8+ for direct evidence, 0.4-0.7 for partial, 0 for unknown.`,
        ].join("\n"),
        prompt: `Parse and answer this security questionnaire by investigating the company's connected apps:\n\n${rawText}`,
        output: Output.object({ schema: ResultSchema }),
      });

      questions = result.output?.questions || [];
    } catch (err) {
      console.error("Questionnaire processing failed:", err);
    }

    await sql`UPDATE questionnaire SET status = 'completed', questions = ${JSON.stringify(questions)} WHERE id = ${questionnaireId}`;

    return { completed: true, total: questions.length };
  },
});
