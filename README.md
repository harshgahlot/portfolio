# harshgahlot.dev — portfolio, built in public

**Live: [portfolio-harsh-gahlot-s-projects.vercel.app](https://portfolio-harsh-gahlot-s-projects.vercel.app)**

My portfolio, run like a Forward-Deployed-Engineer engagement: a skeleton deployed on day zero, then demo-gated sprints — every push to `main` goes straight to production, so the site is never more than one commit away from showing its current state.

## Stack

- **Next.js 16** (App Router, RSC, Turbopack) + TypeScript + **Tailwind v4** (CSS-first `@theme` tokens — no config file)
- **GSAP 3.15** (SplitText, ScrambleText, ScrollTrigger — all free now) + **Motion** for React-idiomatic transitions
- **Lenis** smooth scroll, driven from GSAP's ticker
- **View Transitions API** page cross-fades (production only — see below)
- Deployed on **Vercel**, auto-deploy on push

## How it's built

- **One motion vocabulary.** Durations, easings, and staggers live once — as CSS tokens in `@theme` and as TS constants in `src/lib/motion.ts`. Every component speaks the same timing language; nothing is hardcoded.
- **Server-first.** Pages are Server Components; animation code lives in small `"use client"` leaves. All hero/section text is in the HTML before any JS runs.
- **Reduced motion is a first-class path.** Every animation sits inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` — reduced-motion users get a static, fully readable site, not a broken one.
- **Transform/opacity only.** No layout-triggering animations; Core Web Vitals budgets: LCP ≤ 1.8s, INP ≤ 200ms, CLS ≤ 0.05.
- **Primitives, demoed on themselves.** `MaskedText`, `MagneticButton`, `Marquee`, `Preloader` live in `src/components/primitives/` and are showcased on [/craft](https://portfolio-harsh-gahlot-s-projects.vercel.app/craft) — the styleguide animates itself with its own components.

## Battle scars (real bugs, real fixes)

- **View transitions freeze dev.** Dev-mode on-demand compiles exceed the browser's ~4s view-transition budget → `TimeoutError`, and a pending transition blocks all pointer events. Fix: plain `next/link` in development, transition Link in production (`src/components/transition-link.tsx`).
- **The split hero needs an opaque top layer.** A clip-path split with a transparent overlay doesn't *replace* the layer beneath — it paints over it. One `bg` class turns the effect from garbled overlap into a true two-world split.
- **Lenis arrives one render late.** Reading `lenisRef.current.lenis` in a mount effect gets `undefined`; the `useLenis()` hook is the reliable wiring for `ScrollTrigger.update`.
- **Hover gates should be `any-hover`.** `(hover: hover)` is false on touch-primary devices even with a mouse plugged in.

## Sprint log

| Sprint | Scope | Status |
|---|---|---|
| S0 | Scaffold, tokens, Lenis+GSAP wiring, deploy pipeline | ✅ live |
| S1 | Motion design system + [/craft](https://portfolio-harsh-gahlot-s-projects.vercel.app/craft) styleguide | ✅ live |
| S2 | Dual-identity clip-path hero, sticky nav, proof section, parallax footer | ✅ live |
| S3 | Project case studies (Content Collections + shared-element transitions) | next |
| S4 | "Ask Harsh's AI" — RAG chatbot about me (AI SDK, precomputed embeddings, no vector DB) | planned |
| S5 | Blog + SEO (MDX, OG images, JSON-LD) | planned |
| S6 | Performance/a11y hardening, launch | planned |

## Run it

```bash
npm install
npm run dev   # http://localhost:3000
```

---

**Harsh Gahlot** — Backend Engineer × Applied AI · [LinkedIn](https://www.linkedin.com/in/h-gahlot) · harsh09gahlot@gmail.com
