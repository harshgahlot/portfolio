"use client";

import { useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import { TransitionLink } from "@/components/transition-link";
import { links } from "@/lib/content";
import { DUR, EASE } from "@/lib/motion";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

const FOCUS_CLASSES =
  "transition-colors duration-base ease-out-expo hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
const LINK_CLASSES = `text-ink-muted ${FOCUS_CLASSES}`;
const WORDMARK_CLASSES = `text-ink ${FOCUS_CLASSES}`;

/**
 * Fixed top bar. Hides on scroll down / reveals on scroll up, driven by the
 * Lenis instance's own direction + velocity (via useLenis) rather than a
 * native scroll listener, since Lenis intercepts scroll. Under reduced
 * motion the bar just stays put — no hide/reveal animation.
 */
export function SiteNav() {
  const navRef = useRef<HTMLElement>(null);
  const hiddenRef = useRef(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  useLenis(
    (lenis) => {
      if (prefersReducedMotion) return;
      const nav = navRef.current;
      if (!nav) return;

      if (Math.abs(lenis.velocity) < 0.1) return;

      const shouldHide = lenis.direction === 1 && lenis.scroll > nav.offsetHeight;
      if (shouldHide === hiddenRef.current) return;
      hiddenRef.current = shouldHide;

      gsap.to(nav, {
        yPercent: shouldHide ? -100 : 0,
        duration: DUR.base,
        ease: EASE.out,
        overwrite: true,
      });
    },
    [prefersReducedMotion]
  );

  return (
    <header
      ref={navRef}
      className="fixed inset-x-0 top-0 z-50 border-b border-surface bg-bg/70 backdrop-blur"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 font-mono text-xs uppercase tracking-widest sm:px-10">
        <TransitionLink href="/" className={WORDMARK_CLASSES}>
          HG — S2
        </TransitionLink>
        <div className="flex items-center gap-6">
          <TransitionLink href="/#work" className={LINK_CLASSES}>
            work
          </TransitionLink>
          <TransitionLink href="/craft" className={LINK_CLASSES}>
            craft
          </TransitionLink>
          <TransitionLink href="/blog" className={LINK_CLASSES}>
            blog
          </TransitionLink>
          <a href={links.resume} download className={LINK_CLASSES}>
            resume
          </a>
          <a href="#contact" className={LINK_CLASSES}>
            contact
          </a>
        </div>
      </nav>
    </header>
  );
}
