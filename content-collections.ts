import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import { z } from "zod";

// Dual Shiki theme for fenced code blocks in blog posts. The site itself has
// no light/dark toggle (globals.css defines one fixed dark palette — see
// AGENTS.md), so this doesn't switch anything live today; it's still wired
// the "correct" dual-theme way (shiki emits per-token `--shiki-light` /
// `--shiki-dark` CSS vars instead of baking one theme's colors into the
// output) so a future light mode wouldn't require re-touching this option.
// `keepBackground: false` drops shiki's own inline background-color so the
// code block's background comes from our own `--color-surface` token instead
// (see the `[data-rehype-pretty-code-figure]` rules in globals.css).
const CODE_THEME = { light: "github-light", dark: "github-dark-default" };

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

const posts = defineCollection({
  name: "posts",
  directory: "content/blog",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    date: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
    // See the Gotchas section in AGENTS.md — explicit `content` avoids the
    // "implicit addition of a content property" deprecation warning.
    content: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      rehypePlugins: [
        [rehypePrettyCode, { theme: CODE_THEME, keepBackground: false }],
      ],
    });

    // Reading time is derived from the raw MDX word count at build time —
    // no external package needed for a single "N min read" estimate.
    const wordCount = document.content.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = `${Math.max(1, Math.round(wordCount / 200))} min read`;

    return {
      ...document,
      mdx,
      url: `/blog/${document.slug}`,
      readingTime,
    };
  },
});

export default defineConfig({
  content: [works, posts],
});
