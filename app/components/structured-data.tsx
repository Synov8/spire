/**
 * <StructuredData /> — general-purpose JSON-LD renderer.
 *
 * Accepts a single `Schema` object OR an array of them (for pages that
 * emit multiple top-level schemas, e.g. /pricing with one Product per
 * tier). Each schema is JSON.stringified and injected into a
 * `<script type="application/ld+json">` block.
 *
 * Where this component renders in the JSX tree matters for validator +
 * search-engine crawl efficiency, but Google accepts JSON-LD anywhere
 * in the HTML. We render inside the page body, near (or above) the
 * content the schema describes.
 *
 * Safety:
 *   • `JSON.stringify` already escapes `<`, `>`, `&`, `"`, and other
 *     HTML-significant characters. The dangerouslySetInnerHTML payload
 *     is therefore safely injectable JSON-LD, not raw user input.
 *   • `Math.random` and other non-deterministic values are NOT used
 *     (schemas are static factory output), so SSR HTML and hydrated
 *     client HTML match byte-for-byte — no hydration mismatch.
 *
 * Usage:
 *   ```tsx
 *   // Single schema
 *   <StructuredData schemas={organizationSchema()} />
 *
 *   // Array of schemas
 *   <StructuredData schemas={pricingProductSchemas()} />
 *
 *   // Multiple per route
 *   <StructuredData schemas={[softwareApplicationSchema(), homeFaqPageSchema()]} />
 *
 *   // Optional schema (renders nothing when the factory returns null)
 *   <StructuredData schemas={faqPageSchema(faqItems)} />
 *   ```
 *
 * When a factory returns `null` (e.g. a post that has no FAQ block to
 * mark up), the component renders nothing — same behaviour as the legacy
 * `FAQSchema` helper from app/components/geo-schema.tsx, which short-
 * circuited via early-return.
 */

import type { Schema } from "~/lib/structured-data";

export { type Schema } from "~/lib/structured-data";

export function StructuredData({
  schemas,
}: {
  schemas: Schema | Schema[] | null;
}) {
  if (!schemas) return null;
  const arr = Array.isArray(schemas) ? schemas : [schemas];
  return (
    <>
      {arr.map((s, i) => (
        <script
          key={`${s["@type"]}-${i}`}
          type="application/ld+json"
          // JSON.stringify escapes all HTML-significant characters, so
          // this dangerouslySetInnerHTML payload is safely injectable.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}
