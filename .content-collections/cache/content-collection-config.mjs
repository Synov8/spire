// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";
import remarkGfm from "remark-gfm";
import { z } from "zod";
var posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "**/*.md",
  schema: z.object({
    title: z.string(),
    published: z.string(),
    updated: z.string().optional(),
    description: z.string(),
    author: z.string().default("Spire Team"),
    tags: z.array(z.string()).default([]),
    image: z.string().optional()
  }),
  transform: async (document, context) => {
    const html = await compileMarkdown(context, document, { remarkPlugins: [remarkGfm] });
    const slug = document._meta.path.replace(/\.md$/, "");
    return { ...document, slug, html, published: new Date(document.published), updated: document.updated ? new Date(document.updated) : void 0 };
  }
});
var content_collections_default = defineConfig({ content: [posts] });
export {
  content_collections_default as default
};
