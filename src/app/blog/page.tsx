import type { Metadata } from "next";
import { allPosts } from "content-collections";
import { TransitionLink } from "@/components/transition-link";
import { MaskedText } from "@/components/primitives/masked-text";
import { BlogReveal } from "@/components/blog-reveal";
import { formatPostDate } from "@/lib/format";
import { STAGGER } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on backend engineering and applied AI, written up as they happen.",
  openGraph: {
    title: "Blog — Harsh Gahlot",
    description: "Notes on backend engineering and applied AI, written up as they happen.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Harsh Gahlot",
    description: "Notes on backend engineering and applied AI, written up as they happen.",
  },
};

const FOCUS_CLASSES =
  "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
const ROW_TEXT_CLASSES =
  "transition-colors duration-base ease-out-expo group-hover:text-accent";

export default function BlogIndexPage() {
  const posts = [...allPosts]
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <main className="mx-auto max-w-5xl px-6 pb-32 pt-32 sm:px-10 sm:pt-40">
      <MaskedText
        as="p"
        type="words"
        stagger={STAGGER.tight}
        className="font-mono text-xs uppercase tracking-[0.3em] text-accent"
      >
        Writing
      </MaskedText>

      <MaskedText
        as="h1"
        type="lines"
        className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl"
      >
        Blog.
      </MaskedText>

      <MaskedText
        as="p"
        type="lines"
        className="mt-6 max-w-2xl text-lg text-ink-muted"
      >
        Notes on backend engineering and applied AI — written up as they
        happen.
      </MaskedText>

      {posts.length > 0 ? (
        <BlogReveal className="mt-16 border-t border-surface">
          {posts.map((post) => (
            <TransitionLink
              key={post.slug}
              href={post.url}
              className={`group flex flex-col gap-2 border-b border-surface py-6 sm:py-8 ${FOCUS_CLASSES}`}
            >
              <span
                className={`font-mono text-xs uppercase tracking-widest text-ink-muted ${ROW_TEXT_CLASSES}`}
              >
                {formatPostDate(post.date)} · {post.readingTime}
              </span>
              <span
                className={`text-2xl font-semibold tracking-tight text-ink sm:text-3xl ${ROW_TEXT_CLASSES}`}
              >
                {post.title}
              </span>
              <span className="max-w-2xl text-base text-ink-muted">
                {post.summary}
              </span>
              {post.tags.length > 0 ? (
                <span className="mt-1 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-surface px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              ) : null}
            </TransitionLink>
          ))}
        </BlogReveal>
      ) : (
        <p className="mt-16 border-t border-surface pt-10 text-ink-muted">
          Nothing published yet — check back soon.
        </p>
      )}
    </main>
  );
}
