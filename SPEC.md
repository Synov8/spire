# Spire — Product Spec

## One-line

Continuously running AI compliance automation for B2B SaaS — auto-gathers evidence, evaluates controls, and fills security questionnaires from live infrastructure.

## Frameworks

- SOC 2 (Trust Services Criteria — Security, Availability, Processing Integrity, Confidentiality, Privacy)
- EU AI Act (10 mapped articles: risk management, data governance, logging, transparency, human oversight, accuracy, governance, etc.)

## Core workflows

**Autonomous audit:** User clicks "New audit" → AI agent connects via Composio OAuth to their integrated tools (GitHub, Stripe, Cloudflare, Neon, etc.) → streams tool calls in real time → evaluates each control as pass / fail / warning / unknown → stores results → user reviews on dashboard.

**Manual evidence + re-evaluation:** User uploads files (multi-file, R2-backed) → batch re-evaluates all non-pass controls with evidence as context.

**Questionnaire auto-fill:** User uploads security questionnaire (PDF/docx) → Trigger.dev task parses it → investigation agent uses Composio tools to gather evidence from infrastructure → drafts per-question answers with confidence scores → user reviews and PDF exports.

**Trust center:** Public page displaying static compliance posture snapshot with badge counts.

## Architecture

| Layer | Technology |
|-------|-----------|
| Framework | React Router v8 (framework mode) |
| Hosting | Cloudflare Workers |
| Database | Neon Serverless Postgres + Drizzle ORM |
| Auth | Better Auth (magic-link, organizations, Stripe subscriptions) |
| Background jobs | Trigger.dev v4 (audit, questionnaire, health-check tasks) |
| File storage | Cloudflare R2 (`spire-evidence` bucket) |
| AI | OpenRouter (deepseek/deepseek-v4-flash), Vercel AI SDK streamText |
| Integrations | Composio OAuth (30+ tools — GitHub, Stripe, Cloudflare, Neon, Notion, Resend, etc.) |
| PDF generation | @react-pdf/renderer (client-side via `.client.ts`) |

## Deliverables

- Streamed audit log showing each tool call and control evaluation in real time
- Structured control results (control ID, status, explanation, evidence citations, remediation steps)
- PDF compliance report (per-framework, multi-framework, or full)
- PDF questionnaire export
- Per-question confidence scores for human review
- Health check endpoint (DB, Stripe prices, Resend, Trigger.dev)

## Pricing

- Starter: £200/mo
- Growth: £1,200/mo
- Enterprise: £3,000/mo

## What Spire is not

- Not a CPA firm — does not issue signed SOC 2 reports. Provides evidence automation so your auditor works faster.
- Not a SIEM or monitoring tool — operates read-only during audit runs.
- Not self-serve PLG yet — currently demo-led.
