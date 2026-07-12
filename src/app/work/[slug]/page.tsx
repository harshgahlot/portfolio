import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { allWorks } from "content-collections";
import { MDXContent } from "@content-collections/mdx/react";
import { TransitionLink } from "@/components/transition-link";
import { MaskedText } from "@/components/primitives/masked-text";
import { CoverArt } from "@/components/cover-art";
import { FlowDiagram } from "@/components/mdx/flow-diagram";
import { Aside } from "@/components/mdx/aside-note";
import { CaseStudyReveal } from "@/components/case-study-reveal";
import { STAGGER } from "@/lib/motion";

// React 19 supports `viewTransitionName` in inline styles, but the installed
// @types/react CSSProperties may not declare it yet — widen locally.
type ViewTransitionStyle = CSSProperties & { viewTransitionName?: string };

const mdxComponents = { FlowDiagram, Aside };

const FOCUS_CLASSES =
  "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

function getWork(slug: string) {
  return allWorks.find((work) => work.slug === slug && !work.draft);
}

export async function generateStaticParams() {
  return allWorks.filter((work) => !work.draft).map((work) => ({ slug: work.slug }));
}

// Anything not returned by generateStaticParams (unknown slugs, and the
// draft: true stubs) 404s instead of falling back to on-demand rendering.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return {};

  return {
    title: `${work.title} — Harsh Gahlot`,
    description: work.summary,
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();

  const nonDraft = allWorks
    .filter((w) => !w.draft)
    .sort((a, b) => a.order - b.order);
  const currentIndex = nonDraft.findIndex((w) => w.slug === work.slug);
  const next =
    nonDraft.length > 1
      ? nonDraft[(currentIndex + 1) % nonDraft.length]
      : null;

  const coverStyle: ViewTransitionStyle = {
    viewTransitionName: `vt-cover-${work.slug}`,
  };

  return (
    <main className="mx-auto max-w-3xl px-6 pb-32 pt-32 sm:px-10 sm:pt-40">
      <TransitionLink
        href="/#work"
        className={`font-mono text-xs uppercase tracking-widest text-ink-muted transition-colors duration-base ease-out-expo hover:text-accent ${FOCUS_CLASSES}`}
      >
        ← Index
      </TransitionLink>

      <div className="mt-10">
        <MaskedText
          as="p"
          type="words"
          stagger={STAGGER.tight}
          className="font-mono text-xs uppercase tracking-[0.3em] text-accent"
        >
          {work.kicker}
        </MaskedText>

        <MaskedText
          as="h1"
          type="lines"
          className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl"
        >
          {work.title}
        </MaskedText>

        <MaskedText
          as="p"
          type="lines"
          className="mt-6 max-w-2xl text-lg text-ink-muted"
        >
          {work.summary}
        </MaskedText>

        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-widest text-ink-muted">
          <span>{work.type}</span>
          {work.award ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-accent">{work.award}</span>
            </>
          ) : null}
          <span className="flex flex-wrap gap-2">
            {work.stack.map((item) => (
              <span
                key={item}
                className="rounded-full border border-surface px-3 py-1"
              >
                {item}
              </span>
            ))}
          </span>
        </div>
      </div>

      <div
        style={coverStyle}
        className="relative mt-12 overflow-hidden rounded-lg border border-surface"
      >
        <CoverArt slug={work.slug} />
      </div>

      <CaseStudyReveal className="mt-14 sm:mt-16">
        <MDXContent code={work.mdx} components={mdxComponents} />
      </CaseStudyReveal>

      {next ? (
        <TransitionLink
          href={next.url}
          className={`group mt-24 flex flex-col gap-3 border-t border-surface pt-10 ${FOCUS_CLASSES}`}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-ink-muted transition-colors duration-base ease-out-expo group-hover:text-accent">
            Next case study
          </span>
          <span className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-ink transition-colors duration-base ease-out-expo group-hover:text-accent sm:text-5xl">
            {next.title}
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-base ease-out-expo group-hover:translate-x-2"
            >
              →
            </span>
          </span>
        </TransitionLink>
      ) : null}
    </main>
  );
}
