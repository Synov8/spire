/**
 * Append documentation sections to existing Notion pages.
 * Usage: npx tsx scripts/notion-append.ts <page-id>
 * 
 * Page IDs:
 *   Security & Access Control: 392e252d-f60e-8124-b2ca-d245cd8acfd1
 *   Risk Management & Ops:     392e252d-f60e-813b-a007-df6f7498bcba
 *   Corporate Governance:      392e252d-f60e-814d-aca8-c25511f5da4b
 *   AI Governance:             392e252d-f60e-81a6-9ab5-fdcab162cbb5
 */
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";

const apiKey = process.env.COMPOSIO_API_KEY;
if (!apiKey) { console.error("COMPOSIO_API_KEY not set"); process.exit(1); }

const composio = new Composio({ provider: new VercelProvider(), apiKey });
const ORG_ID = "self-audit";

// Each section to append as markdown
async function appendToPage(pageId: string, markdown: string) {
  try {
    const result = await (composio as any).tools.execute("NOTION_APPEND_MARKDOWN", {
      userId: ORG_ID,
      arguments: { page_id: pageId, markdown },
      dangerouslySkipVersionCheck: true,
    });
    console.log(`  Appended: ${result?.successful ? "OK" : "Failed"}`);
  } catch (e: any) {
    console.log(`  Error (may already exist): ${e.message?.slice(0, 100)}`);
  }
}

async function main() {
  const cmd = process.argv[2];
  if (!cmd) { console.log("Usage: notion-append.ts <all|security|risk|governance|ai>"); process.exit(1); }

  // CC6.3/CC6.4 - Access Removal & Reviews
  if (cmd === "all" || cmd === "security") {
    console.log("Appending to Security & Access Control...");
    await appendToPage("392e252d-f60e-8124-b2ca-d245cd8acfd1", `
## Access Reviews (CC6.4)
- Access rights are reviewed quarterly (March, June, September, December)
- Reviews cover: GitHub, Stripe, Cloudflare, Neon, Notion, Resend
- Review findings are documented and tracked
- Stale accounts are disabled within 30 days

## Access Removal (CC6.3)
- Upon termination, access is revoked within 24 hours
- API keys and tokens are rotated when no longer needed
- Removal is logged for audit purposes

## Change Management (CC8.1, CC8.2)
- All code changes go through GitHub pull request workflow
- Emergency changes bypass PR but require retrospective approval within 24 hours
- Changes tracked via git with full history
`);
  }

  // Fraud risk, breach notification, BCP
  if (cmd === "all" || cmd === "risk") {
    console.log("Appending to Risk Management & Operations...");
    await appendToPage("392e252d-f60e-813b-a007-df6f7498bcba", `
## Fraud Risk (CC3.2)
- Fraud risk is assessed as part of the quarterly risk assessment
- Existing controls address fraud: Stripe fraud prevention, access controls, credential management
- Payment processing via Stripe provides built-in fraud detection

## Business Continuity (CC9.1, A1.3)
- Cloudflare Workers: geographic redundancy across multiple regions
- Neon database: 6-hour point-in-time recovery, multi-region replication
- Business continuity plan tested annually

## Data Breach Notification (P8.1)
- Data breaches are detected via automated monitoring
- Critical incidents are escalated within 24 hours
- Regulatory notification: within 72 hours (UK GDPR)
- Affected data subjects notified without undue delay
`);
  }

  // Data classification, data subject rights, data quality
  if (cmd === "all" || cmd === "governance") {
    console.log("Appending to Corporate Governance & Privacy...");
    await appendToPage("392e252d-f60e-814d-aca8-c25511f5da4b", `
## Data Classification (C1.2)
Data is classified into four tiers:
- **Public**: Marketing materials, website content
- **Internal**: Policies, procedures, internal documentation
- **Confidential**: Customer data, financial records, credentials
- **Restricted**: Legal documents, security investigation findings

## Data Subject Rights (P1.3, P3.1, P3.2)
- Rights covered: access, rectification, erasure, restriction, portability
- Requests submitted via hello@synov8studio.com
- Acknowledged within 48 hours, fulfilled within 30 days

## Data Quality (P5.1)
- Data accuracy maintained through automated validation (Stripe, GitHub)
- Customer data reviewed on each audit run
- Manual corrections processed on request
`);
  }

  // AI literacy, logging, content labelling
  if (cmd === "all" || cmd === "ai") {
    console.log("Appending to AI Governance...");
    await appendToPage("392e252d-f60e-81a6-9ab5-fdcab162cbb5", `
## AI-Generated Content Labelling (UPDATED)
- **Implemented July 2026**: AI-generated audit reports and downloads are labelled as "AI-generated" in the interface and exported PDFs.
- Visible labels appear on the audit stream page and compliance report downloads.

## AI Literacy (AI-4)
- All employees complete AI literacy training at onboarding
- Covers: capabilities, limitations, risks, data handling
- Refresher training conducted annually

## AI Logging (AI-5)
- Model inputs (audit prompts) and outputs (reports) are logged
- Model ID (DeepSeek V4 Flash) recorded per audit run
- System prompt versions tracked via git
- Logs retained for minimum 6 months
`);
  }

  console.log("Done.");
}

main().catch(console.error);
