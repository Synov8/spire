import { task } from "@trigger.dev/sdk";
import { generateText, Output } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";

const QuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
  confidence: z.number().min(0).max(1),
  category: z.string(),
});

const BatchSchema = z.object({
  answers: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    confidence: z.number().min(0).max(1),
  })),
});

export const investigateQuestionnaire = task({
  id: "investigate-questionnaire",
  run: async (payload: { orgId: string; questionnaireId: string; questions: z.infer<typeof QuestionSchema>[] }) => {
    const { orgId, questionnaireId, questions } = payload;

    const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });
    const model = openrouter.chat("deepseek/deepseek-v4-flash", {
      temperature: 0,
      reasoning: { effort: "xhigh" },
    });

    const composio = new Composio({
      provider: new VercelProvider(),
      apiKey: process.env.COMPOSIO_API_KEY!,
    });

    const session = await composio.create(orgId);
    const tools = await session.tools();

    const sql = neon(process.env.DATABASE_URL!);
    const verdicts = await sql`SELECT rule_id, status, detail FROM policy_check WHERE organization_id = ${orgId}`;
    const verdictText = verdicts.map((v: any) => `${v.rule_id}: ${v.status} — ${v.detail || "no detail"}`).join("\n");

    const questionsText = questions.map((q, i) => `${i + 1}. ${q.question}`).join("\n");

    const result = await generateText({
      model,
      tools,
      prompt: [
        `You are a compliance investigator at Spire. You have live access to the company's connected infrastructure via Composio tools.`,
        ``,
        `Existing audit verdicts (from policy_check):`,
        verdictText,
        ``,
        `A vendor security questionnaire was uploaded. For each question below, use your Composio tools to probe the company's connected apps and find evidence to support or refute each answer.`,
        ``,
        `Questions to investigate:`,
        questionsText,
        ``,
        `For each question:`,
        `1. Use Composio tools to probe relevant connected apps (GitHub, Stripe, Neon, Cloudflare, etc.)`,
        `2. Check the existing audit verdicts for relevant controls`,
        `3. Answer based on what you actually find — not assumptions`,
        `4. Set confidence high (0.8+) when you have direct evidence, medium (0.4-0.7) when you have partial evidence, low (<0.4) when you cannot find evidence`,
        ``,
        `Output your findings as an array of answers, one per question.`,
      ].join("\n"),
      output: Output.object({ schema: BatchSchema }),
    });

    const updatedQuestions = questions.map((q) => {
      const match = result.output.answers.find((a) => a.question === q.question);
      if (match) {
        return { ...q, answer: match.answer, confidence: match.confidence };
      }
      return q;
    });

    await sql`
      UPDATE questionnaire SET questions = ${JSON.stringify(updatedQuestions)} WHERE id = ${questionnaireId}
    `;

    return { completed: true, total: updatedQuestions.length };
  },
});
