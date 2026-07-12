import { allWorks } from "content-collections";
import { Hero } from "@/components/hero";
import { Proof } from "@/components/proof";
import { WorkIndex } from "@/components/work-index";
import { Marquee } from "@/components/primitives/marquee";
import { SiteFooter } from "@/components/site-footer";

// Trimmed to the plain, serializable shape WorkIndex ("use client") needs —
// it doesn't get the compiled MDX body or raw frontmatter extras.
const works = [...allWorks]
  .sort((a, b) => a.order - b.order)
  .map((work) => ({
    title: work.title,
    slug: work.slug,
    url: work.url,
    type: work.type,
    stack: work.stack,
    summary: work.summary,
    draft: work.draft,
  }));

export default function Home() {
  return (
    <>
      <Hero />
      <Proof />
      <WorkIndex works={works} />
      <Marquee speed={40} className="border-y border-surface py-8">
        <span className="mx-8 whitespace-nowrap font-mono text-sm uppercase tracking-widest text-ink-muted sm:text-base">
          Java · Spring Boot · Kafka · PostgreSQL · Docker · RAG · LangChain ·
          Next.js
        </span>
      </Marquee>
      <SiteFooter />
    </>
  );
}
