"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  // ReactLenis constructs its Lenis instance inside its own effect (one
  // render behind ours), so `lenisRef.current.lenis` is still undefined the
  // instant this component's effect first runs. `useLenis()` reads from the
  // library's reactive root store instead, so it re-renders once the
  // instance actually exists.
  const lenis = useLenis();

  useEffect(() => {
    if (prefersReducedMotion) return;

    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Lenis intercepts native scroll, so ScrollTrigger never sees a scroll
    // event on its own — nudge it to recompute on every Lenis tick.
    lenis?.on("scroll", ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(update);
      lenis?.off("scroll", ScrollTrigger.update);
    };
  }, [prefersReducedMotion, lenis]);

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, autoRaf: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
