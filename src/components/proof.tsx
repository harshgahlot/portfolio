"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MaskedText } from "@/components/primitives/masked-text";
import { about, metrics } from "@/lib/content";
import { DUR, EASE, STAGGER } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * "Proof, not adjectives" — eyebrow, headline, the about paragraph, and the
 * four verified metrics as stat tiles. The #work anchor now lives on
 * WorkIndex (S3), directly below this section.
 */
export function Proof() {
  const tilesRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!tilesRef.current) return;
        const tiles = tilesRef.current.querySelectorAll("[data-tile]");

        const tween = gsap.from(tiles, {
          autoAlpha: 0,
          y: 24,
          duration: DUR.slow,
          ease: EASE.out,
          stagger: STAGGER.base,
          scrollTrigger: {
            trigger: tilesRef.current,
            start: "top 85%",
            once: true,
          },
        });

        return () => tween.kill();
      });

      return () => mm.revert();
    },
    { scope: tilesRef }
  );

  return (
    <section className="mx-auto max-w-5xl px-6 py-28 sm:px-10 sm:py-36">
      <MaskedText
        as="p"
        type="words"
        stagger={STAGGER.tight}
        className="font-mono text-xs uppercase tracking-[0.3em] text-accent"
      >
        Proof, not adjectives
      </MaskedText>

      <MaskedText
        as="h2"
        type="lines"
        className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl"
      >
        Shipped, in production, measured.
      </MaskedText>

      <MaskedText
        as="p"
        type="lines"
        className="mt-8 max-w-xl text-base text-ink-muted sm:text-lg"
      >
        {about}
      </MaskedText>

      <div
        ref={tilesRef}
        className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-surface bg-surface sm:grid-cols-4"
      >
        {metrics.map((metric) => (
          <div key={metric.label} data-tile className="bg-bg p-6 sm:p-8">
            <p className="font-mono text-3xl tabular-nums text-ink sm:text-4xl">
              {metric.value}
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-ink-muted">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
