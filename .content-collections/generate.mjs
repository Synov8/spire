import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
const contentDir = join(dir, "..", "content");
const outDir = join(dir, "generated");

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return {};
  const fm = {};
  const lines = m[1].split("\n");
  let listKey = null;
  for (const line of lines) {
    if (/^\s+-\s/.test(line) && listKey) {
      fm[listKey].push(line.trim().replace(/^- /, "").replace(/^["']|["']$/g, ""));
      continue;
    }
    listKey = null;
    const sep = line.indexOf(":");
    if (sep > 0 && line[sep + 1] !== undefined) {
      const key = line.slice(0, sep).trim();
      let val = line.slice(sep + 1).trim();
      if (val === "") {
        listKey = key;
        fm[key] = [];
      } else if (val.startsWith("[") && val.endsWith("]")) {
        fm[key] = val.slice(1, -1).split(", ").map((s) => s.replace(/^["']|["']$/g, ""));
      } else {
        fm[key] = val.replace(/^["']|["']$/g, "");
      }
    }
  }
  return fm;
}

const files = readdirSync(contentDir).filter((f) => f.endsWith(".md"));
const posts = files.map((f) => {
  const raw = readFileSync(join(contentDir, f), "utf8");
  const fm = parseFrontmatter(raw);
  const slug = f.replace(/\.md$/, "");
  return {
    slug,
    title: fm.title || "",
    description: fm.description || "",
    published: fm.published || "2026-01-01",
    updated: fm.updated || undefined,
    author: fm.author || "Spire Team",
    tags: fm.tags || [],
    html: "",
  };
});

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "allPosts.js"), `export const allPosts = ${JSON.stringify(posts, null, 2)};\n`);
writeFileSync(join(outDir, "index.js"), `export { allPosts } from "./allPosts.js";\n`);
writeFileSync(join(outDir, "index.d.ts"), `import configuration from "../../content-collections.ts";\nimport { GetTypeByName } from "@content-collections/core";\nexport type Post = GetTypeByName<typeof configuration, "posts">;\nexport declare const allPosts: Array<Post>;\n`);

console.log(`Generated ${posts.length} posts`);