import type { Metadata } from "next";
import { TransitionLink } from "@/components/transition-link";
import { MaskedText } from "@/components/primitives/masked-text";
import { MagneticButton } from "@/components/primitives/magnetic-button";
import { Marquee } from "@/components/primitives/marquee";
import { Preloader } from "@/components/primitives/preloader";
import { DUR, EASE, STAGGER } from "@/lib/motion";

const CRAFT_DESCRIPTION =
  "The motion system behind this site — durations, eases, and stagger from a single source of truth, demoed live with the primitives that build the rest of the pages.";

export const metadata: Metadata = {
  title: "Craft",
  description: CRAFT_DESCRIPTION,
  openGraph: {
    title: "Craft — Harsh Gahlot",
    description: CRAFT_DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Craft — Harsh Gahlot",
    description: CRAFT_DESCRIPTION,
  },
};

function CraftSection({
  index,
  name,
  note,
  children,
}: {
  index: string;
  name: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 border-t border-surface pt-10 first-of-type:mt-16">
      <MaskedText
        as="h2"
        type="words"
        stagger={STAGGER.tight}
        className="font-mono text-xs uppercase tracking-widest text-ink-muted"
      >
        {`${index} · ${name}`}
      </MaskedText>
      <p className="mt-4 max-w-xl text-sm text-ink-muted">{note}</p>
      <div className="mt-8 rounded-md border border-surface p-8 sm:p-12">
        {children}
      </div>
    </section>
  );
}

const TOKEN_ROWS = [
  ...Object.entries(DUR).map(([key, value]) => ({
    token: `DUR.${key}`,
    value: `${value}s`,
  })),
  ...Object.entries(EASE).map(([key, value]) => ({
    token: `EASE.${key}`,
    value: String(value),
  })),
  ...Object.entries(STAGGER).map(([key, value]) => ({
    token: `STAGGER.${key}`,
    value: `${value}s`,
  })),
];

export default function CraftPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 pb-32 pt-32 sm:px-10 sm:pt-40">
      <TransitionLink
        href="/"
        className="font-mono text-xs uppercase tracking-widest text-ink-muted transition-colors duration-base ease-out-expo hover:text-accent"
      >
        ← index
      </TransitionLink>

      <p className="mt-10 font-mono text-xs uppercase tracking-[0.3em] text-ink-muted">
        MOTION SYSTEM · S1
      </p>
      <h1 className="mt-4 text-6xl font-semibold tracking-tight text-ink sm:text-7xl">
        Craft
      </h1>
      <p className="mt-6 max-w-xl text-lg text-ink-muted">
        One motion vocabulary — durations, eases, and stagger pulled from a
        single source of truth — demoed live below, using the same
        primitives that build the rest of this site.
      </p>

      <CraftSection
        index="01"
        name="MaskedText"
        note="SplitText + ScrollTrigger reveal — lines or words mask in past 85% of the viewport, once."
      >
        <div className="space-y-8">
          <MaskedText
            as="h3"
            type="lines"
            className="max-w-lg text-2xl font-semibold leading-tight text-ink sm:text-3xl"
          >
            Backend engineer building applied AI
          </MaskedText>
          <MaskedText
            as="p"
            type="words"
            stagger={STAGGER.tight}
            className="text-base text-ink-muted"
          >
            20+ microservices in production
          </MaskedText>
        </div>
      </CraftSection>

      <CraftSection
        index="02"
        name="MagneticButton"
        note="Pointer-following pill button, gated to hover-capable and motion-safe devices — a plain button everywhere else."
      >
        <div className="flex flex-wrap items-center gap-4">
          <MagneticButton href="#resume">View resume</MagneticButton>
          <MagneticButton>Ask my AI</MagneticButton>
        </div>
      </CraftSection>

      <CraftSection
        index="03"
        name="Marquee"
        note="Duplicated track loops xPercent 0 to -50, pauses on hover, collapses to one static row under reduced motion."
      >
        <Marquee speed={40}>
          <span className="mx-8 whitespace-nowrap font-mono text-sm uppercase tracking-widest text-ink-muted sm:text-base">
            Java · Spring Boot · Kafka · RAG · LangChain
          </span>
        </Marquee>
      </CraftSection>

      <CraftSection
        index="04"
        name="Preloader"
        note="Replayable curtain + mono counter demo — not wired into the site chrome yet."
      >
        <Preloader />
      </CraftSection>

      <section className="mt-16 border-t border-surface pt-10">
        <MaskedText
          as="h2"
          type="words"
          stagger={STAGGER.tight}
          className="font-mono text-xs uppercase tracking-widest text-ink-muted"
        >
          Tokens
        </MaskedText>
        <p className="mt-4 max-w-xl text-sm text-ink-muted">
          The values every primitive on this page pulls from{" "}
          <code className="text-ink">src/lib/motion.ts</code>.
        </p>
        <div className="mt-8 overflow-x-auto rounded-md border border-surface">
          <table className="w-full min-w-[420px] border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-surface text-left text-ink">
                <th className="px-4 py-3 font-medium">Token</th>
                <th className="px-4 py-3 font-medium">Value</th>
              </tr>
            </thead>
            <tbody className="text-ink-muted">
              {TOKEN_ROWS.map((row) => (
                <tr key={row.token} className="border-b border-surface/60 last:border-b-0">
                  <td className="px-4 py-3">{row.token}</td>
                  <td className="px-4 py-3">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
