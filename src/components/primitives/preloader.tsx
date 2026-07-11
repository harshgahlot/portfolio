"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DUR, EASE } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

/**
 * Self-contained, replayable preloader demo (not wired into the site chrome
 * yet — this is a /craft showpiece). A surface-colored curtain counts
 * 000 -> 100, then lifts via a clip-path reveal to expose the panel content.
 */
export function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const playRef = useRef<() => void>(() => {});

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const curtain = curtainRef.current;
        const counter = counterRef.current;
        if (!curtain || !counter) return;

        const counterObj = { value: 0 };

        const tl = gsap.timeline({
          paused: true,
          onComplete: () => setHasPlayed(true),
        });

        tl.set(curtain, { clipPath: "inset(0% 0% 0% 0%)", autoAlpha: 1 })
          .set(counterObj, { value: 0 })
          .to(counterObj, {
            value: 100,
            duration: DUR.slow * 2,
            ease: "none",
            snap: { value: 1 },
            onUpdate: () => {
              counter.textContent = String(Math.round(counterObj.value)).padStart(
                3,
                "0"
              );
            },
          })
          .to(curtain, {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 0.9,
            ease: EASE.inOut,
          });

        playRef.current = () => tl.restart();

        return () => {
          tl.kill();
        };
      });

      // Reduced motion: the curtain is hidden outright (see className below)
      // and the content is already visible, so replay has nothing to do.

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative h-64 overflow-hidden rounded-md border border-surface sm:h-72"
    >
      <div className="flex h-full items-center justify-center bg-bg px-6">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-ink sm:text-base">
          Harsh Gahlot — Portfolio
        </p>
      </div>

      <div
        ref={curtainRef}
        className="absolute inset-0 flex items-center justify-center bg-surface motion-reduce:hidden"
        style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      >
        <span
          ref={counterRef}
          className="font-mono text-3xl tabular-nums text-ink sm:text-4xl"
        >
          000
        </span>
      </div>

      <button
        type="button"
        onClick={() => playRef.current()}
        className="absolute bottom-3 right-3 rounded-full border border-accent px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-ink transition-colors duration-base ease-out-expo hover:bg-accent hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {hasPlayed ? "Replay" : "Play"}
      </button>
    </div>
  );
}
