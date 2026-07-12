"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MaskedText } from "@/components/primitives/masked-text";
import { CoverArt } from "@/components/cover-art";
import { TransitionLink } from "@/components/transition-link";
import { DUR, EASE, STAGGER } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

export type WorkIndexItem = {
  title: string;
  slug: string;
  url: string;
  type: string;
  stack: string[];
  summary: string;
  draft: boolean;
};

type WorkIndexProps = {
  works: WorkIndexItem[];
};

// React 19 supports `viewTransitionName` in inline styles, but the installed
// @types/react CSSProperties may not declare it yet — widen locally.
type PreviewStyle = CSSProperties & { viewTransitionName?: string };

const PANEL_MARGIN = 16;
const PANEL_OFFSET_X = 28;
const DEFAULT_PANEL_SIZE = { width: 320, height: 240 };

// One query drives both the GSAP hover behavior (mm.add below) and the
// shared-element wiring: on touch / reduced-motion the panel must not carry a
// view-transition-name either, or taps (pointerenter fires on tap) would make
// the hidden panel a morph source and the case-study hero would fly in from
// the viewport corner. Media-query state is read via useSyncExternalStore per
// house convention (see smooth-scroll.tsx; setState-in-effect is linted out).
const PREVIEW_QUERY =
  "(any-hover: hover) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(PREVIEW_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(PREVIEW_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

const ROW_TEXT_CLASSES =
  "transition-colors duration-base ease-out-expo group-hover:text-accent";
const FOCUS_CLASSES =
  "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

/**
 * "Snellenberg move": a big index list of case studies with a cursor-follow
 * preview panel. The panel only ever appears on hover-capable, motion-safe
 * devices (gsap.matchMedia gate below) — everywhere else these are just
 * plain links.
 */
export function WorkIndex({ works }: WorkIndexProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelSizeRef = useRef(DEFAULT_PANEL_SIZE);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const previewCapable = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(PREVIEW_QUERY, () => {
          const list = listRef.current;
          const panel = panelRef.current;
          if (!list || !panel) return;

          gsap.set(panel, {
            autoAlpha: 0,
            scale: 0.95,
            xPercent: -50,
            yPercent: -50,
          });

          const xTo = gsap.quickTo(panel, "x", {
            duration: DUR.base,
            ease: EASE.out,
          });
          const yTo = gsap.quickTo(panel, "y", {
            duration: DUR.base,
            ease: EASE.out,
          });

          function updatePosition(e: PointerEvent) {
            const { width, height } = panelSizeRef.current;
            const minX = width / 2 + PANEL_MARGIN;
            const maxX = window.innerWidth - width / 2 - PANEL_MARGIN;
            const minY = height / 2 + PANEL_MARGIN;
            const maxY = window.innerHeight - height / 2 - PANEL_MARGIN;
            xTo(gsap.utils.clamp(minX, maxX, e.clientX + PANEL_OFFSET_X));
            yTo(gsap.utils.clamp(minY, maxY, e.clientY));
          }

          function onEnter(e: PointerEvent) {
            const rect = panel!.getBoundingClientRect();
            panelSizeRef.current = { width: rect.width, height: rect.height };
            updatePosition(e);
            gsap.to(panel, {
              autoAlpha: 1,
              scale: 1,
              duration: DUR.base,
              ease: EASE.out,
            });
          }

          function onLeave() {
            gsap.to(panel, {
              autoAlpha: 0,
              scale: 0.95,
              duration: DUR.fast,
              ease: EASE.out,
            });
          }

          list.addEventListener("pointerenter", onEnter);
          list.addEventListener("pointermove", updatePosition);
          list.addEventListener("pointerleave", onLeave);

          return () => {
            list.removeEventListener("pointerenter", onEnter);
            list.removeEventListener("pointermove", updatePosition);
            list.removeEventListener("pointerleave", onLeave);
            gsap.set(panel, { autoAlpha: 0 });
          };
      });

      // Touch / reduced motion: no listeners attached, panel stays at its
      // resting opacity-0 — rows below are plain links regardless.

      return () => mm.revert();
    },
    { scope: listRef }
  );

  const previewStyle: PreviewStyle =
    previewCapable && activeSlug
      ? { viewTransitionName: `vt-cover-${activeSlug}` }
      : {};

  return (
    <section
      id="work"
      className="mx-auto max-w-5xl px-6 py-28 sm:px-10 sm:py-36"
    >
      <MaskedText
        as="p"
        type="words"
        stagger={STAGGER.tight}
        className="font-mono text-xs uppercase tracking-[0.3em] text-accent"
      >
        Selected work
      </MaskedText>

      <MaskedText
        as="h2"
        type="lines"
        className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl"
      >
        Four builds, end to end.
      </MaskedText>

      <div ref={listRef} className="mt-16 border-t border-surface">
        {works.map((work, index) => {
          const indexLabel = String(index + 1).padStart(2, "0");
          const metaLine = [work.type, work.stack.slice(0, 3).join(" · ")]
            .filter(Boolean)
            .join(" · ");

          if (work.draft) {
            return (
              <div
                key={work.slug}
                className="flex flex-col gap-2 border-b border-surface py-6 text-ink-muted opacity-50 sm:flex-row sm:items-baseline sm:gap-6 sm:py-8"
              >
                <span className="font-mono text-sm sm:text-base">
                  {indexLabel}
                </span>
                <span className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {work.title}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest sm:ml-auto sm:text-sm">
                  {metaLine}
                </span>
                <span className="w-fit rounded-full border border-surface px-3 py-1 font-mono text-[10px] uppercase tracking-widest sm:text-xs">
                  Write-up soon
                </span>
              </div>
            );
          }

          return (
            <TransitionLink
              key={work.slug}
              href={work.url}
              onPointerEnter={() => setActiveSlug(work.slug)}
              className={`group flex flex-col gap-2 border-b border-surface py-6 sm:flex-row sm:items-baseline sm:gap-6 sm:py-8 ${FOCUS_CLASSES}`}
            >
              <span
                className={`font-mono text-sm text-ink-muted sm:text-base ${ROW_TEXT_CLASSES}`}
              >
                {indexLabel}
              </span>
              <span
                className={`text-2xl font-semibold tracking-tight text-ink sm:text-3xl ${ROW_TEXT_CLASSES}`}
              >
                {work.title}
              </span>
              <span
                className={`font-mono text-xs uppercase tracking-widest text-ink-muted sm:ml-auto sm:text-sm ${ROW_TEXT_CLASSES}`}
              >
                {metaLine}
              </span>
            </TransitionLink>
          );
        })}
      </div>

      <div
        ref={panelRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-40 w-[clamp(240px,26vw,380px)] overflow-hidden rounded-md border border-surface opacity-0"
      >
        <div style={previewStyle} className="aspect-[4/3] w-full">
          {previewCapable && activeSlug ? <CoverArt slug={activeSlug} /> : null}
        </div>
      </div>
    </section>
  );
}
