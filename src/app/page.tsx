import { Hero } from "@/components/hero";
import { Proof } from "@/components/proof";
import { Marquee } from "@/components/primitives/marquee";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <Hero />
      <Proof />
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
