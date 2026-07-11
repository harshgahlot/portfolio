"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DUR, EASE, STAGGER } from "@/lib/motion";

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger);

type MaskedTextTag = "h2" | "h3" | "p";
type MaskedTextSplit = "lines" | "words";

type MaskedTextProps = {
  children: React.ReactNode;
  as?: MaskedTextTag;
  type?: MaskedTextSplit;
  stagger?: number;
  scrub?: boolean;
  once?: boolean;
  className?: string;
};

/**
 * Reveals text line-by-line (or word-by-word) as it scrolls into view, via a
 * masked SplitText + ScrollTrigger. Renders fully visible, unsplit text under
 * reduced motion.
 */
export function MaskedText({
  children,
  as = "p",
  type = "lines",
  stagger = STAGGER.base,
  scrub = false,
  once = true,
  className,
}: MaskedTextProps) {
  // Cast to ElementType so the ref prop resolves generically instead of
  // fighting TS over the union of per-tag ref types for a dynamic tag name.
  const Component = as as React.ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!ref.current) return;

        const split = SplitText.create(ref.current, { type, mask: type });
        const targets = type === "lines" ? split.lines : split.words;

        const tween = gsap.from(targets, {
          yPercent: 100,
          duration: DUR.slow,
          ease: EASE.out,
          stagger,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            once,
            scrub,
          },
          onComplete: () => split.revert(),
        });

        return () => {
          tween.kill();
          split.revert();
        };
      });

      // Reduced motion: markup renders fully visible with no split/transform,
      // so there is nothing to animate or revert here.

      return () => mm.revert();
    },
    { scope: ref, dependencies: [type, stagger, scrub, once] }
  );

  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}
