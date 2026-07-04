/**
 * Explore existing Notion pages to understand current documentation structure.
 * Run: npx tsx scripts/notion-explore.ts
 */
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { readFileSync } from "fs";

const apiKey = process.env.COMPOSIO_API_KEY;
if (!apiKey) { console.error("COMPOSIO_API_KEY not set"); process.exit(1); }

const composio = new Composio({ provider: new VercelProvider(), apiKey });
const ORG_ID = "self-audit";

async function main() {
  const cmd = process.argv[2] || "search";

  if (cmd === "search") {
    // Search for all pages
    const queries = ["policy", "security", "access control", "change management", "governance", "risk", "incident", "privacy", "compliance", "AI"];
    for (const q of queries) {
      console.log(`\n=== Searching: "${q}" ===`);
      try {
        const result = await (composio as any).tools.execute("NOTION_SEARCH_NOTION_PAGE", {
          userId: ORG_ID,
          arguments: { query: q, page_size: 10 },
          dangerouslySkipVersionCheck: true,
        });
        const results = result?.response?.data?.results || result?.data?.results || [];
        if (results.length === 0) {
          console.log("No results");
          continue;
        }
        for (const r of results) {
          console.log(`  [${r.id}] ${r.title || r.properties?.title?.title?.[0]?.plain_text || "Untitled"}`);
        }
      } catch (e: any) {
        console.log(`  Error: ${e.message || e}`);
      }
    }
  }

  if (cmd === "page" && process.argv[3]) {
    // Get page content
    const pageId = process.argv[3];
    console.log(`\n=== Getting page: ${pageId} ===`);
    try {
      const result = await (composio as any).tools.execute("NOTION_GET_PAGE_MARKDOWN", {
        userId: ORG_ID,
        arguments: { page_id: pageId },
        dangerouslySkipVersionCheck: true,
      });
      console.log(result?.response?.data?.markdown?.slice(0, 3000) || JSON.stringify(result).slice(0, 2000));
    } catch (e: any) {
      console.log(`Error: ${e.message || e}`);
    }
  }

  if (cmd === "append" && process.argv[3]) {
    // Append content to an existing page
    const pageId = process.argv[3];
    // This would need to use NOTION_UPDATE_PAGE or NOTION_APPEND_BLOCK
    console.log("Append not yet implemented");
  }

  console.log("\nDone.");
}

main().catch(console.error);
