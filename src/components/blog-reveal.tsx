"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DUR, EASE } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type RevealProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Generic scroll-in reveal for a list of top-level blocks: each direct child
 * fades + translates up as it crosses the same 85%-viewport trigger point
 * used by MaskedText/CaseStudyReveal elsewhere. Transform/opacity only, and
 * fully gated behind gsap.matchMedia on (prefers-reduced-motion: no-preference)
 * — reduced-motion users get the plain, fully visible markup. Used by the
 * blog index (S5) for its post rows; kept separate from CaseStudyReveal since
 * that component also forces the `cs-prose` typography class.
 */
export function BlogReveal({ children, className }: RevealProps) {
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
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
