"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const footerRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!headingRef.current) return;

        const split = SplitText.create(headingRef.current, {
          type: "lines",
          mask: "lines",
        });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        tl.from(split.lines, {
          yPercent: 100,
          duration: 1,
          stagger: 0.12,
        })
          .from(
            subRef.current,
            { autoAlpha: 0, y: 16, duration: 0.8 },
            "-=0.6"
          )
          .from(
            footerRef.current,
            { autoAlpha: 0, y: 8, duration: 0.6 },
            "-=0.4"
          );

        // Runs when the matchMedia condition stops matching, or on unmount.
        return () => {
          tl.kill();
          split.revert();
        };
      });

      // Reduced motion: markup is already fully visible with no transforms
      // applied, so there is nothing to animate or revert here.

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col justify-between gap-16 bg-bg px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="flex flex-1 flex-col items-start justify-center">
        <h1
          ref={headingRef}
          className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-7xl lg:text-8xl"
        >
          <span className="block">Backend engineer</span>
          <span className="block">
            <span className="text-accent">&times;</span> applied AI
          </span>
        </h1>
        <p
          ref={subRef}
          className="mt-8 max-w-xl text-lg text-ink-muted sm:text-xl"
        >
          Portfolio in production since day zero. Built in public, sprint by
          sprint.
        </p>
      </div>
      <p
        ref={footerRef}
        className="font-mono text-xs uppercase tracking-widest text-ink-muted"
      >
        S0 · deployed day zero · harsh gahlot 2026
      </p>
    </section>
  );
}
