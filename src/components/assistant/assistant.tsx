"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";

const AssistantPanel = dynamic(() => import("./panel"), {
  ssr: false,
  loading: () => <PanelLoadingState />,
});

function PanelLoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-50 rounded-lg border border-surface bg-bg/85 p-6 text-center font-mono text-xs uppercase tracking-widest text-ink-muted shadow-xl backdrop-blur-md sm:inset-x-auto sm:bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:right-[max(1rem,env(safe-area-inset-right))] sm:w-[380px]"
    >
      Loading assistant…
    </div>
  );
}

const LAUNCHER_CLASSES =
  "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 inline-flex items-center gap-2 rounded-full border border-accent bg-bg px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink shadow-lg outline-none transition-colors duration-base ease-out-expo hover:bg-accent hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

/**
 * Floating "Ask my AI" launcher, rendered on every page from the root
 * layout. Deliberately dependency-light — no gsap, no `ai`, nothing from
 * the chat stack — so it costs almost nothing in the shared bundle. The
 * panel (useChat, the AI SDK, all the chat UI) is code-split via
 * next/dynamic and only fetched on first click.
 *
 * Once opened, the panel component is kept mounted (never re-unmounted) so
 * a visitor's conversation survives closing and reopening the widget; only
 * its `open` prop toggles, which drives its own CSS open/close transition.
 */
export function Assistant() {
  const [open, setOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);

  function toggleOpen() {
    setOpen((prev) => {
      const next = !prev;
      if (next) setHasOpenedOnce(true);
      return next;
    });
  }

  function handleRequestClose() {
    setOpen(false);
  }

  function handleClosed() {
    launcherRef.current?.focus();
  }

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={LAUNCHER_CLASSES}
      >
        <span aria-hidden="true">✦</span>
        Ask my AI
      </button>
      {hasOpenedOnce && (
        <AssistantPanel
          open={open}
          onRequestClose={handleRequestClose}
          onClosed={handleClosed}
        />
      )}
    </>
  );
}
