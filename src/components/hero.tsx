"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { NAME, identities } from "@/lib/content";
import { DUR, EASE, STAGGER } from "@/lib/motion";

gsap.registerPlugin(useGSAP, SplitText, ScrambleTextPlugin);

const NAME_CLASSES =
  "text-[clamp(2.75rem,9vw,12rem)] font-black uppercase leading-none tracking-tight";

/**
 * Signature dual-identity hero. Two absolutely-stacked layers render the same
 * giant name — a base "backend" layer in ink, and an accent "AI" layer
 * clipped to the right of a --split custom property. On hover-capable,
 * motion-safe devices the cursor's X position drives --split live; everyone
 * else gets a static 50/50 split with the divider still visible.
 */
export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const baseNameRef = useRef<HTMLHeadingElement>(null);
  const topNameRef = useRef<HTMLDivElement>(null);
  const backendLabelRef = useRef<HTMLParagraphElement>(null);
  const backendLineRef = useRef<HTMLParagraphElement>(null);
  const aiLabelRef = useRef<HTMLParagraphElement>(null);
  const aiLineRef = useRef<HTMLParagraphElement>(null);
  const scrollCueRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!baseNameRef.current || !topNameRef.current) return;

        const baseSplit = SplitText.create(baseNameRef.current, {
          type: "chars",
          mask: "chars",
        });
        const topSplit = SplitText.create(topNameRef.current, {
          type: "chars",
          mask: "chars",
        });

        const tl = gsap.timeline({ defaults: { ease: EASE.out } });

        tl.from([...baseSplit.chars, ...topSplit.chars], {
          yPercent: 100,
          duration: DUR.slow,
          stagger: STAGGER.tight,
        })
          .from(
            [
              backendLabelRef.current,
              backendLineRef.current,
              aiLabelRef.current,
              aiLineRef.current,
            ],
            {
              autoAlpha: 0,
              y: 16,
              duration: DUR.base,
              stagger: STAGGER.base,
            },
            "-=0.3"
          )
          .add(() => {
            if (!aiLineRef.current) return;
            gsap.to(aiLineRef.current, {
              duration: 1,
              ease: "none",
              scrambleText: {
                text: identities.ai.line,
                chars: "upperAndLowerCase",
                revealDelay: 0.1,
                speed: 0.4,
              },
            });
          });

        if (scrollCueRef.current) {
          gsap.to(scrollCueRef.current, {
            y: 8,
            duration: DUR.slow * 2,
            ease: EASE.inOut,
            yoyo: true,
            repeat: -1,
          });
        }

        return () => {
          tl.kill();
          baseSplit.revert();
          topSplit.revert();
        };
      });

      mm.add(
        "(any-hover: hover) and (prefers-reduced-motion: no-preference)",
        () => {
          const el = containerRef.current;
          if (!el) return;

          // Proxy object: gsap.quickTo eases a plain numeric value, and each
          // update writes it straight onto the --split custom property
          // (consumed by clip-path on the AI layer and transform on the
          // divider below) — transform/clip-path only, no layout props.
          const state = { v: 50 };
          const quickSplit = gsap.quickTo(state, "v", {
            duration: 0.5,
            ease: EASE.out,
            onUpdate: () => el.style.setProperty("--split", `${state.v}vw`),
          });

          function onMove(e: PointerEvent) {
            const pct = gsap.utils.clamp(
              0,
              100,
              (e.clientX / window.innerWidth) * 100
            );
            quickSplit(pct);
          }

          function onLeave() {
            quickSplit(50);
          }

          el.addEventListener("pointermove", onMove);
          el.addEventListener("pointerleave", onLeave);

          return () => {
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerleave", onLeave);
            el.style.removeProperty("--split");
          };
        }
      );

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      style={{ "--split": "50vw" } as React.CSSProperties}
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-bg"
    >
      {/* Base layer: backend identity, ink on bg, always fully visible. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <h1 ref={baseNameRef} className={`${NAME_CLASSES} text-ink`}>
          {NAME}
        </h1>
        <p
          ref={backendLabelRef}
          className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-ink-muted sm:text-sm"
        >
          {identities.backend.label}
        </p>
        <p
          ref={backendLineRef}
          className="mt-2 text-sm text-ink-muted sm:text-base"
        >
          {identities.backend.line}
        </p>
      </div>

      {/* Top layer: AI identity, accent, clipped to the right of --split. The
          giant name here is a visual duplicate (aria-hidden) — the real,
          accessible heading lives in the base layer above. */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{ clipPath: "inset(0 0 0 var(--split))" }}
      >
        <div ref={topNameRef} aria-hidden="true" className={`${NAME_CLASSES} text-accent`}>
          {NAME}
        </div>
        <p
          ref={aiLabelRef}
          className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-accent/80 sm:text-sm"
        >
          {identities.ai.label}
        </p>
        <p ref={aiLineRef} className="mt-2 text-sm text-accent/80 sm:text-base">
          {identities.ai.line}
        </p>
      </div>

      {/* Divider: thin line at the split position, transform-driven so it
          never triggers layout even while dragging across the viewport. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-px bg-accent"
        style={{ transform: "translateX(var(--split))" }}
      />

      <p
        ref={scrollCueRef}
        className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-muted"
      >
        scroll
      </p>
    </section>
  );
}
