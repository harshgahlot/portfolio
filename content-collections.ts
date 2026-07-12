import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";

// NOTE: `schema` must be a StandardSchema-compliant object (e.g. a zod schema
// instance), not a `(z) => ({...})` shape function. That older pattern is
// retired in @content-collections/core 0.15.x and throws a RetiredFeatureError
// at build time ("The use of a function as a schema is retired.") — see the
// Gotchas section in AGENTS.md.
const works = defineCollection({
  name: "works",
  directory: "content/work",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    kicker: z.string(),
    summary: z.string(),
    type: z.string(),
    stack: z.array(z.string()),
    award: z.string().optional(),
    order: z.number(),
    draft: z.boolean().default(false),
    // The "frontmatter" parser (default) always supplies the MDX body as
    // `content` — declaring it explicitly avoids the
    // "implicit addition of a content property" deprecation warning.
    content: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);

    return {
      ...document,
      mdx,
      url: `/work/${document.slug}`,
    };
  },
});

export default defineConfig({
  content: [works],
});
