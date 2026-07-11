"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type MarqueeProps = {
  children: React.ReactNode;
  /** Pixels per second the track travels. */
  speed?: number;
  className?: string;
};

/**
 * Infinite horizontal marquee. Content is duplicated so the loop can travel
 * xPercent 0 -> -50 seamlessly; the duplicate is `aria-hidden` and hidden
 * outright under reduced motion, leaving one static row.
 */
export function Marquee({ children, speed = 40, className }: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const track = trackRef.current;
        const container = containerRef.current;
        if (!track || !container) return;

        // Track holds two copies of the content back to back; half its
        // scrollWidth is the distance of exactly one loop.
        const distance = track.scrollWidth / 2;
        const duration = distance / speed;

        const tl = gsap.timeline({ repeat: -1 }).to(track, {
          xPercent: -50,
          duration,
          ease: "none",
        });

        function pause() {
          tl.pause();
        }
        function play() {
          tl.play();
        }

        container.addEventListener("pointerenter", pause);
        container.addEventListener("pointerleave", play);

        return () => {
          tl.kill();
          container.removeEventListener("pointerenter", pause);
          container.removeEventListener("pointerleave", play);
        };
      });

      // Reduced motion: track sits at its natural xPercent (0) and the
      // duplicate copy is hidden via CSS, so only one static row is visible.

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [speed] }
  );

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className ?? ""}`.trim()}
    >
      <div ref={trackRef} className="flex w-max">
        <div className="flex shrink-0 items-center">{children}</div>
        <div
          className="flex shrink-0 items-center motion-reduce:hidden"
          aria-hidden="true"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
