/**
 * Single motion vocabulary for the site. Mirrors the duration/easing tokens
 * defined in `src/app/globals.css` (`@theme`), expressed as TS constants for
 * use in GSAP tweens (GSAP can't read CSS custom properties for eases/durations).
 * Every primitive should pull from here instead of hardcoding values.
 */

export const DUR = {
  fast: 0.18,
  base: 0.28,
  slow: 0.7,
} as const;

export const EASE = {
  out: "expo.out",
  inOut: "power3.inOut",
  elastic: "elastic.out(1, 0.4)",
} as const;

export const STAGGER = {
  tight: 0.04,
  base: 0.08,
} as const;
