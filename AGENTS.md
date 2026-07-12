<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Harsh Gahlot — Portfolio

Personal portfolio, built in public as FDE-style sprints (deploy day zero, demo gate per sprint).
Live: https://portfolio-harsh-gahlot-s-projects.vercel.app · Repo: https://github.com/harshgahlot/portfolio
Full build plan: `C:\Users\Harsh\Desktop\Resume\portfolio-build-plan.html`

## Stack (verified mid-2026 — do NOT trust older tutorial patterns)
- Next.js 16 App Router, Turbopack (default bundler; no --turbopack flag exists anymore), TypeScript
- Tailwind v4: tokens live in `@theme` in `src/app/globals.css` — there is NO tailwind.config.js. Fonts are wired in a separate `@theme inline` block (required for next/font vars).
- GSAP 3.15 + @gsap/react: ALL plugins are free (SplitText, ScrambleText, ScrollTrigger, Flip…) and ship in the `gsap` package. Always `useGSAP({ scope })`, plugins registered at module scope.
- `motion` package (NOT framer-motion) — import from `"motion/react"`.
- `lenis` (NOT @studio-freight/*) — provider in `src/components/smooth-scroll.tsx`, driven by gsap.ticker.
- `next-view-transitions` for page cross-fades — but ONLY in production; dev uses plain next/link (see gotcha below).
- AI SDK 6 (`ai` / `@ai-sdk/react` / `@ai-sdk/anthropic`, installed via the `ai-v6` dist-tag — see Gotchas) powers the S4 "Ask Harsh's AI" assistant (`src/app/api/ask/route.ts`, `src/components/assistant/*`); `@upstash/ratelimit` + `@upstash/redis` rate-limit it, no-op with a console warning if their env vars are absent.

## Conventions
- One motion vocabulary: durations/easings/staggers come from `src/lib/motion.ts` (DUR/EASE/STAGGER) and the matching `@theme` tokens. Never hardcode durations.
- Server Components by default; animation code lives in small `"use client"` leaf components.
- Every animation sits inside `gsap.matchMedia()` gated on `(prefers-reduced-motion: no-preference)`. Reduced-motion users get a static, fully readable page — non-negotiable.
- Transform/opacity-only tweens (Core Web Vitals: LCP ≤1.8s, INP ≤200ms, CLS ≤0.05).
- Internal links use `TransitionLink` from `src/components/transition-link.tsx`, never next/link directly.
- Primitives live in `src/components/primitives/` (MaskedText, MagneticButton, Marquee, Preloader) and are demoed on `/craft`.
- Real, verified facts only (from the resume): 2+ yrs at Mindsprint (Junior SE Jul 2024 → SE Apr 2026, promotion + bonus), built 7+ microservices, maintains 20+, ~6,000+ users, weekly Jenkins deploys, prod releases every 1–2 months, 2nd place company-wide RAG hackathon. Never invent metrics.
- Contact: harsh09gahlot@gmail.com · linkedin.com/in/h-gahlot · github.com/harshgahlot

## Gotchas already hit (do not re-learn these)
- Dev-mode view transitions freeze the page and throw "TimeoutError: Transition was aborted because of timeout in DOM update" (on-demand compiles exceed the ~4s VT budget, and pending transitions block pointer events). Hence `transition-link.tsx` uses next/link in development.
- Lenis instance is one render late: use the `useLenis()` hook, never `lenisRef.current.lenis` in a mount effect. `lenis.on("scroll", ScrollTrigger.update)` is wired in smooth-scroll.tsx.
- Hover gates use `(any-hover: hover)`, not `(hover: hover)` (touch-primary devices with mice).
- Next 16 lint rule `react-hooks/set-state-in-effect` forbids setState-in-effect; use `useSyncExternalStore` for media-query subscriptions (see smooth-scroll.tsx).
- Vercel project was imported from an empty repo → framework preset saved as "Other"; `vercel.json` pins `"framework": "nextjs"`. Keep that file.
- `@content-collections/core` 0.15.x retired the `schema: (z) => ({...})` shape-function pattern shown in the package's own bundled README (that README is stale relative to the installed version). `schema` must now be a StandardSchema-compliant object — pass a real `z.object({...})` instance directly. Passing a function throws `RetiredFeatureError: The use of a function as a schema is retired` at build time.
- The default "frontmatter" parser implicitly adds a `content: string` field to a collection's output; relying on that silently is deprecated (`[CC DEPRECATED]: The implicit addition of a content property...`). Declare `content: z.string()` in the schema explicitly.
- `withContentCollections` (the `@content-collections/next` plugin) works fine under Turbopack for both `next dev` and `next build` on Next 16 — confirmed by its own CHANGELOG ("Add support for Next.js 16", "Support for turbopack") and by our build/dev runs. It never touches webpack config; it just runs the content-collections builder as a side effect keyed off `process.argv`. No CLI/`predev` fallback was needed for S3.
- Generated collections land in `.content-collections/generated` (gitignored) and are imported via a bare `content-collections` specifier, resolved by a tsconfig `paths` alias (`"content-collections": ["./.content-collections/generated"]`) — also added to ESLint's `globalIgnores` since it's generated, not hand-written.
- `@content-collections/mdx/react`'s `MDXContent` auto-picks its Server vs Client implementation via the package's `"react-server"` export condition — importing it directly into a Server Component page (no `"use client"`) just works, no special handling needed.
- `MaskedText`'s tag union was `"h2" | "h3" | "p"` — no `"h1"`. Extended it to include `"h1"` for the case-study page's title (h1 is the semantically correct tag there, not h2).
- Nav's "work" anchor had to become `/#work` (absolute path + hash) instead of `#work` so it also works when clicked from a `/work/[slug]` page. That trips ESLint's `@next/next/no-html-link-for-pages` on a plain `<a>` once the href starts with `/` — switched it to `TransitionLink`, which handles hash fragments fine for both same-page and cross-page cases.
- **AI SDK 6 versioning (S4):** `ai`'s own npm `latest` tag has already moved to v7, and `@ai-sdk/react`/`@ai-sdk/anthropic` do NOT share `ai`'s major version number at all (their own `latest` tags are v4/v4). To install the matched v6 set, use each package's `ai-v6` dist-tag: `npm install ai@ai-v6 @ai-sdk/react@ai-v6 @ai-sdk/anthropic@ai-v6` — resolved here to `ai@6.0.224` / `@ai-sdk/react@3.0.226` / `@ai-sdk/anthropic@3.0.96` (confirmed matched via `@ai-sdk/react`'s own `package.json` `dependencies.ai === "6.0.224"`).
- `convertToModelMessages()` is **async** in this AI SDK 6 build (`Promise<ModelMessage[]>`) — must be awaited before handing the result to `streamText({ messages })`.
- `DefaultChatTransport` lives in `"ai"`, not `"@ai-sdk/react"` — the react package only re-exports `UIMessage`/`CreateUIMessage`/`UseCompletionOptions` from `ai`, not the transport classes.
- `useChat`'s built-in `HttpChatTransport` throws `new Error(await response.text())` on any non-2xx response from the chat API route, so the client-side `error.message` is literally your route's raw JSON error body as a string (e.g. `'{"error":"offline"}'`). To show a specific line per error code, `JSON.parse(error.message).error` with a try/catch fallback for non-JSON bodies (network errors, proxy/HTML error pages) — see `panel.tsx`'s `getFriendlyError`.
- `react-hooks/set-state-in-effect` (see the media-query gotcha above) also fires for the common "mirror an incoming prop into local state that should outlive the prop's own lifetime" pattern (e.g. play a close animation, then unmount). Fix per React's own docs: compare the prop to a `useState`-tracked "previous prop" value and call setState conditionally **during render**, not inside `useEffect` — see `assistant/panel.tsx`'s `open`/`prevOpen` handling. The rule does not fire for setState nested inside an effect's async callback (rAF, setTimeout, a promise, an event listener) — only for synchronous calls directly in the effect body.
- This sandboxed dev/preview browser doesn't just suspend `requestAnimationFrame` (already known) — CSS `transitionend` also never reliably fires here, so any "animate out, then unmount" component needs a `setTimeout` fallback (sized off the same shared duration token, not a hardcoded number) or it gets stuck open forever *in this environment specifically*. Confirmed via `assistant/panel.tsx`'s close flow: without the fallback the dialog never unmounted and focus never returned to the launcher here; with it, both work every time. Real browsers fire `transitionend` normally — this is a defensive-programming win either way, not a workaround for broken CSS.
- Voyage AI's embeddings endpoint (`POST https://api.voyageai.com/v1/embeddings`) was only verified by reading its documented request/response shape (`input_type: "document"|"query"`, batched `input: string[]`, response `data[].{index,embedding}`) — there's no `VOYAGE_API_KEY` in this environment, so the vector-retrieval path in `retrieval.ts` and the embed step in `embed-corpus.mjs` are code-complete but not live-tested. Smoke-test both (`npm run embed`, then a query through `/api/ask`) once a real key is available.

## Workflow
- `npm run build` AND `npm run lint` must pass before any commit.
- Commits do not get pushed until the change is verified in a browser; push to `main` auto-deploys to production via Vercel.
- Sprint status: S0 (scaffold+deploy) ✅ · S1 (motion system + /craft) ✅ · S2 (hero/about/footer/nav) ✅ · S3 (case studies + work index) ✅ · S4 RAG chatbot ("Ask Harsh's AI") ✅ (lexical retrieval verified end-to-end; needs `ANTHROPIC_API_KEY`/`VOYAGE_API_KEY`/Upstash vars set to go fully live) · S5 blog+SEO next · S6 harden/launch.
- Case-study content lives in `content/work/*.mdx` (Content Collections). RAG + VLS are live; `iraf-2-0` and `agripal` are `draft: true` stubs (index rows only, no pages). All case-study copy stays at résumé altitude — elaborate reasoning is fine, new facts/metrics are not.
