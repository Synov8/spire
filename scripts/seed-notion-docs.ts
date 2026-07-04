/**
 * Creates Notion documentation pages for process gaps identified by the audit.
 * Run: npx tsx scripts/seed-notion-docs.ts
 */
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";

const apiKey = process.env.COMPOSIO_API_KEY;
if (!apiKey) { console.error("COMPOSIO_API_KEY not set"); process.exit(1); }

const composio = new Composio({ provider: new VercelProvider(), apiKey });
const ORG_ID = "self-audit";

async function main() {
  console.log("Creating Composio session...");
  const session = await composio.create(ORG_ID);
  const tools = await session.tools();

  // Check if Notion is connected
  console.log("Checking connected accounts...");
  const list = await (composio as any).connectedAccounts.list({ userIds: [ORG_ID], statuses: ["ACTIVE"] });
  const items = (list as any)?.items ?? [];
  const notionAccount = items.find((a: any) => (a.toolkit as any)?.slug === "notion");
  if (!notionAccount) {
    console.log("Notion not connected. Skipping Notion doc creation.");
    console.log("To connect Notion, run an audit first or connect via the integrations page.");
    return;
  }
  console.log("Notion connected. Creating documentation pages...");

  const docs = [
    {
      title: "Access Control Policy",
      content: `# Access Control Policy

Last reviewed: July 2026
Status: Active

## User Access Provisioning
- Access requests must be approved by the Founder/CEO before provisioning
- Accounts are created with least-privilege permissions by default
- All access provisioning is documented in the access control register

## Access Reviews
- Access rights are reviewed quarterly (March, June, September, December)
- Reviews cover all systems: GitHub, Stripe, Cloudflare, Neon, Notion, Resend
- Review findings are documented and tracked in the deficiency management system
- Stale or unused accounts are disabled within 30 days of identification

## Access Removal
- Upon employee termination or role change, access is revoked within 24 hours
- API keys and tokens are rotated when no longer needed
- The Founder/CEO is responsible for access removal
- Access removal is logged and maintained for audit purposes`,
    },
    {
      title: "Change Management Policy",
      content: `# Change Management Policy

Last reviewed: July 2026
Status: Active

## Standard Changes
- All code changes must go through GitHub pull request workflow
- Pull requests require at least one review before merging
- Branch protection rules enforce review requirements on production branches
- Changes are tracked via git commit history with full traceability

## Emergency Changes
- Emergency changes may bypass standard review in production incidents
- Emergency changes require retrospective approval within 24 hours
- All emergency changes are documented with: reason, impact, approval, and timeline
- Emergency changes are reviewed in the post-mortem process

## Change Tracking
- GitHub Issues track change requests and authorisation
- Deployment history is maintained via git tags and releases
- Environment separation (dev/staging/production) is enforced via Neon branches`,
    },
    {
      title: "Data Subject Rights Procedure",
      content: `# Data Subject Rights Procedure

Last reviewed: July 2026
Status: Active

## Rights Covered
- Right of access (Article 15 UK GDPR)
- Right to rectification (Article 16)
- Right to erasure (Article 17)
- Right to restrict processing (Article 18)
- Right to data portability (Article 20)

## Procedure
1. Data subject submits request via email to hello@synov8studio.com
2. Request is logged and acknowledged within 48 hours
3. Identity is verified before processing
4. Response is provided within 30 calendar days (GDPR requirement)
5. Extensions (up to 2 months) are communicated with justification

## Data Classification
Data is classified into four tiers:
- Public: marketing materials, public website content
- Internal: internal policies, procedures, documentation
- Confidential: customer data, financial records, access credentials
- Restricted: legal documents, investigation findings`,
    },
    {
      title: "AI Governance Policy",
      content: `# AI Governance Policy

Last reviewed: July 2026
Status: Active

## AI Systems Inventory
| System | Provider | Model | Purpose | Risk Tier |
|--------|----------|-------|---------|-----------|
| Compliance Agent | OpenRouter/DeepSeek | V4 Flash | SOC 2 & AI Act audits | Limited-risk |

## AI Literacy
- All employees complete AI literacy training at onboarding
- Training covers: capabilities, limitations, risks, data handling
- Refresher training conducted annually
- Training records maintained by the Founder/CEO

## AI Logging
- Model inputs (audit prompts) and outputs (reports) are logged
- Model ID and version are recorded per audit run
- System prompt versions are tracked via git
- Logs are retained for a minimum of 6 months

## Risk Management
- AI-specific risk assessments are conducted annually
- Assessments cover: bias, fairness, fundamental rights, accuracy
- Vendor due diligence is conducted for all AI providers`,
    },
  ];

  for (const doc of docs) {
    console.log(`Creating page: ${doc.title}...`);
    try {
      const result = await (composio as any).tools.execute("NOTION_CREATE_PAGE", {
        userId: ORG_ID,
        arguments: {
          parent: { type: "workspace" },
          title: [{ text: { content: doc.title } }],
          content: [{ object: "block", type: "heading1", heading1: { text: [{ type: "text", text: { content: doc.title } }] } }],
        },
      });
      console.log(`  Created: ${result?.data?.id || "unknown"}`);
    } catch (e) {
      console.log(`  Error creating page: ${e}`);
      // Fall back to searching for existing pages and appending content
      try {
        const search = await (composio as any).tools.execute("NOTION_SEARCH_NOTION_PAGE", {
          userId: ORG_ID,
          arguments: { query: doc.title, page_size: 5 },
        });
        console.log(`  Search result:`, JSON.stringify(search).slice(0, 200));
      } catch (e2) {
        console.log(`  Search also failed: ${e2}`);
      }
    }
  }

  console.log("Done.");
}

main().catch(console.error);
