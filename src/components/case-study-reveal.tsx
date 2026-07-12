"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DUR, EASE } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type CaseStudyRevealProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Wraps the rendered MDX body of a case study and reveals each top-level
 * block (headings, paragraphs, lists, FlowDiagram/Aside) with a subtle fade +
 * translate-up as it scrolls into view — one ScrollTrigger per block, same
 * trigger point as MaskedText/Proof. Reduced motion: everything renders
 * fully visible, no animation, so the page reads with JS disabled.
 */
export function CaseStudyReveal({ children, className }: CaseStudyRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!ref.current) return;
        const blocks = Array.from(ref.current.children);
        if (blocks.length === 0) return;

        const tweens = blocks.map((block) =>
          gsap.from(block, {
            autoAlpha: 0,
            y: 24,
            duration: DUR.slow,
            ease: EASE.out,
            scrollTrigger: {
              trigger: block,
              start: "top 85%",
              once: true,
            },
          })
        );

        return () => tweens.forEach((tween) => tween.kill());
      });

      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={`cs-prose ${className ?? ""}`.trim()}>
      {children}
    </div>
  );
}
