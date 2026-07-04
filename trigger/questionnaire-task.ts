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

const ParseSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    category: z.string(),
    answer: z.string(),
    confidence: z.number().min(0).max(1),
  })),
});

const BatchSchema = z.object({
  answers: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    confidence: z.number().min(0).max(1),
  })),
});

export const processQuestionnaire = task({
  id: "process-questionnaire",
  run: async (payload: { orgId: string; questionnaireId: string; rawText: string; verdictText: string; controlsText: string }) => {
    const { orgId, questionnaireId, rawText, verdictText, controlsText } = payload;
    const sql = neon(process.env.DATABASE_URL!);

    // Phase 1: Parse questions from the raw text
    const parseResult = await generateText({
      model,
      output: Output.object({ schema: ParseSchema }),
      system: [
        `You are answering a vendor security questionnaire on behalf of the company. Speak as the company — use "we" and be direct.`,
        ``,
        `Company's live audit data:`,
        verdictText || "No audit data available.",
        ``,
        `RULES:`,
        `- Answer each question directly. If data supports a clear answer, give it concisely.`,
        `- If data partially supports an answer, give the best short answer without hedging.`,
        `- If data does NOT cover the question, leave the answer blank (empty string).`,
        `- Confidence: 0.8+ for direct evidence, 0.4-0.7 for partial, 0 for unknown (blank answer).`,
      ].join("\n"),
      prompt: `Parse and answer this security questionnaire based on the company's live audit data:\n\n${rawText}`,
    });

    const parsedQuestions: Array<{ question: string; category: string; answer: string; confidence: number }> = (parseResult as any).output?.questions || (parseResult as any).questions || [];
    let questions = parsedQuestions;
    await sql`UPDATE questionnaire SET status = 'processing', questions = ${JSON.stringify(questions)} WHERE id = ${questionnaireId}`;

    // Phase 2: Investigate with Composio
    const composio = new Composio({
      provider: new VercelProvider(),
      apiKey: process.env.COMPOSIO_API_KEY!,
    });

    let session;
    try {
      session = await composio.create(orgId);
    } catch {
      // No Composio session — skip investigation, mark complete
      await sql`UPDATE questionnaire SET status = 'completed' WHERE id = ${questionnaireId}`;
      return { completed: true, total: questions.length, investigated: false };
    }

    const tools = await session.tools();
    const questionsText = questions.map((q, i) => `${i + 1}. ${q.question}`).join("\n");

    const investigateResult = await generateText({
      model,
      tools,
      prompt: [
        `You are a compliance investigator. You have live Composio tools.`,
        ``,
        `Existing audit data:`,
        verdictText,
        ``,
        `Questions to investigate:`,
        questionsText,
        ``,
        `For each question, probe connected apps and update the answer.`,
        `Set confidence: 0.8+ for direct evidence, 0.4-0.7 for partial, 0 for unknown.`,
      ].join("\n"),
      output: Output.object({ schema: BatchSchema }),
    });

    let updatedQuestions = questions;
    try {
      const answers = investigateResult.output?.answers;
      if (answers) {
        updatedQuestions = questions.map((q) => {
          const match = answers.find((a: any) => a.question === q.question);
          return match ? { ...q, answer: match.answer, confidence: match.confidence } : q;
        });
      }
    } catch {
      // Investigation failed — keep the parsed questions as-is
    }

    await sql`UPDATE questionnaire SET status = 'completed', questions = ${JSON.stringify(updatedQuestions)} WHERE id = ${questionnaireId}`;

    return { completed: true, total: updatedQuestions.length, investigated: false };
  },
});
