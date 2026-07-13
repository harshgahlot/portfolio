"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MaskedText } from "@/components/primitives/masked-text";
import { MagneticButton } from "@/components/primitives/magnetic-button";
import { TransitionLink } from "@/components/transition-link";
import { links } from "@/lib/content";
import { EASE } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const EXTERNAL_LINK_CLASSES =
  "transition-colors duration-base ease-out-expo hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

/**
 * Parallax contact footer. The panel sits yPercent -20 and scrubs to 0 as it
 * enters, so it reads as sliding out from behind the proof section above —
 * transform-only, no layout shift.
 */
export function SiteFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!panelRef.current) return;

        const tween = gsap.fromTo(
          panelRef.current,
          { yPercent: -20 },
          {
            yPercent: 0,
            ease: EASE.out,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "top 40%",
              scrub: true,
            },
          }
        );

        return () => tween.kill();
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id="contact" className="relative overflow-hidden">
      <div
        ref={panelRef}
        className="border-t border-surface bg-bg px-6 py-24 sm:px-10 sm:py-32"
      >
        <MaskedText
          as="h2"
          type="lines"
          className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl"
        >
          Let&rsquo;s build something.
        </MaskedText>

        <div className="mt-12 flex flex-wrap gap-4">
          <MagneticButton href={`mailto:${links.email}`}>
            Email me
          </MagneticButton>
          <MagneticButton href={links.resume} download>
            Download resume
          </MagneticButton>
        </div>

        <div className="mt-16 flex flex-wrap gap-6 font-mono text-xs uppercase tracking-widest text-ink-muted">
          <a
            href={links.github}
            target="_blank"
            rel="noreferrer"
            className={EXTERNAL_LINK_CLASSES}
          >
            GitHub
          </a>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            className={EXTERNAL_LINK_CLASSES}
          >
            LinkedIn
          </a>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-surface pt-6 font-mono text-xs uppercase tracking-widest text-ink-muted">
          <p>Built in public · S2 · © 2026 Harsh Gahlot</p>
          <div className="flex flex-wrap gap-6">
            <TransitionLink href="/blog" className={EXTERNAL_LINK_CLASSES}>
              /blog
            </TransitionLink>
            <TransitionLink href="/craft" className={EXTERNAL_LINK_CLASSES}>
              /craft
            </TransitionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
