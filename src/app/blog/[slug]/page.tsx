import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allPosts } from "content-collections";
import { MDXContent } from "@content-collections/mdx/react";
import { TransitionLink } from "@/components/transition-link";
import { MaskedText } from "@/components/primitives/masked-text";
import { FlowDiagram } from "@/components/mdx/flow-diagram";
import { Aside } from "@/components/mdx/aside-note";
import { BlogReveal } from "@/components/blog-reveal";
import { formatPostDate } from "@/lib/format";
import { STAGGER } from "@/lib/motion";
import { NAME } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

const mdxComponents = { FlowDiagram, Aside };

const FOCUS_CLASSES =
  "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

function getPost(slug: string) {
  return allPosts.find((post) => post.slug === slug && !post.draft);
}

export async function generateStaticParams() {
  return allPosts.filter((post) => !post.draft).map((post) => ({ slug: post.slug }));
}

// Unknown slugs and draft: true posts 404 instead of falling back to
// on-demand rendering — same contract as the case-study pages.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      url: post.url,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  // BlogPosting schema (S5) — see the Person schema in the root layout for
  // the same `<` escaping rationale.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: NAME,
      url: SITE_URL,
    },
    url: `${SITE_URL}${post.url}`,
  };

  return (
    <main className="mx-auto max-w-3xl px-6 pb-32 pt-32 sm:px-10 sm:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <TransitionLink
        href="/blog"
        className={`font-mono text-xs uppercase tracking-widest text-ink-muted transition-colors duration-base ease-out-expo hover:text-accent ${FOCUS_CLASSES}`}
      >
        ← Blog
      </TransitionLink>

      <div className="mt-10">
        <MaskedText
          as="p"
          type="words"
          stagger={STAGGER.tight}
          className="font-mono text-xs uppercase tracking-widest text-ink-muted"
        >
          {formatPostDate(post.date)} · {post.readingTime}
        </MaskedText>

        <MaskedText
          as="h1"
          type="lines"
          className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl"
        >
          {post.title}
        </MaskedText>

        {post.tags.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs uppercase tracking-widest text-ink-muted">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-surface px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <BlogReveal className="blog-prose mt-14 sm:mt-16">
        <MDXContent code={post.mdx} components={mdxComponents} />
      </BlogReveal>
    </main>
  );
}
