"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, TransitionEvent } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { getStarters } from "@/lib/assistant/starters";
import { DUR } from "@/lib/motion";

const CONTACT_EMAIL = "harsh09gahlot@gmail.com";

const PANEL_CLASSES =
  "fixed inset-x-3 bottom-3 z-50 flex max-h-[min(560px,calc(100dvh-6rem))] flex-col overflow-hidden rounded-lg border border-surface bg-bg/85 shadow-xl backdrop-blur-md transition-[opacity,transform] duration-base ease-out-expo motion-reduce:transition-none sm:inset-x-auto sm:bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:right-[max(1rem,env(safe-area-inset-right))] sm:w-[380px]";

const PILL_BUTTON_CLASSES =
  "rounded-full border border-accent px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink outline-none transition-colors duration-base ease-out-expo hover:bg-accent hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function getMessageText(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

/** Maps our API route's JSON error codes to a friendly inline line. */
function getFriendlyError(error: Error | undefined): string | null {
  if (!error) return null;

  let code: string | undefined;
  try {
    const parsed = JSON.parse(error.message) as { error?: string };
    code = parsed.error;
  } catch {
    code = undefined;
  }

  if (code === "offline") {
    return `The assistant isn't wired to a brain yet — email ${CONTACT_EMAIL} instead.`;
  }
  if (code === "rate_limited") {
    return "You're sending messages quickly — give it a minute.";
  }
  return `Something hiccuped. Try again, or email ${CONTACT_EMAIL}.`;
}

type AssistantPanelProps = {
  /** Target open/closed state, owned by the launcher. */
  open: boolean;
  /** Close button / Esc asks the launcher to flip `open` to false. */
  onRequestClose: () => void;
  /** Fired once the close transition has fully finished (DOM removed). */
  onClosed: () => void;
};

/**
 * The chat panel itself — loaded lazily by assistant.tsx via next/dynamic.
 * Kept mounted across close/reopen (only `open` toggles), so the
 * conversation persists. Motion is CSS-only (opacity + translate via the
 * theme's duration/ease tokens); globals.css already forces near-zero
 * transition durations under prefers-reduced-motion, so no extra JS
 * branching is needed for that.
 */
export default function AssistantPanel({ open, onRequestClose, onClosed }: AssistantPanelProps) {
  const pathname = usePathname();
  const [input, setInput] = useState("");
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, stop, clearError } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ask" }),
  });

  // Mirror `open` into local state during render rather than in an effect
  // (see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  // — also required by this repo's react-hooks/set-state-in-effect lint
  // rule). Mounting the dialog is synchronous; unmounting is deferred to
  // the transitionend handler below so the close animation can play first.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setRendered(true);
    else setVisible(false);
  }

  // Flip to the visible CSS state on the frame after mounting/re-mounting,
  // so the browser has a "closed" frame to transition from.
  useEffect(() => {
    if (!rendered || !open) return;
    const id = requestAnimationFrame(() => setVisible(true));
    inputRef.current?.focus();
    return () => cancelAnimationFrame(id);
  }, [rendered, open]);

  // Safety net: normally the transitionend handler below unmounts once the
  // close transition finishes. If that event is ever missed (backgrounded
  // tab throttling, a browser that doesn't fire it for very short/near-zero
  // durations under prefers-reduced-motion, etc.) this guarantees the panel
  // still unmounts and focus still returns to the launcher, using the same
  // shared duration token the CSS transition itself uses — just as a
  // ceiling, not a replacement for it.
  useEffect(() => {
    if (open || !rendered) return;
    const timeoutId = setTimeout(() => {
      setRendered(false);
      onClosed();
    }, DUR.base * 1000 + 100);
    return () => clearTimeout(timeoutId);
  }, [open, rendered, onClosed]);

  // Esc closes while the panel is open.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onRequestClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onRequestClose]);

  // Auto-scroll to the latest content as messages stream in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  if (!rendered) return null;

  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.propertyName !== "opacity") return;
    if (!open) {
      setRendered(false);
      onClosed();
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || status === "submitted" || status === "streaming") return;
    clearError();
    setInput("");
    void sendMessage({ text });
  }

  function handleStarterClick(text: string) {
    clearError();
    void sendMessage({ text });
  }

  const starters = getStarters(pathname ?? "/");
  const friendlyError = status === "error" ? getFriendlyError(error) : null;
  const lastMessage = messages[messages.length - 1];
  const showStreamingDot =
    status === "streaming" &&
    lastMessage?.role === "assistant" &&
    getMessageText(lastMessage).length === 0;
  const canSend = input.trim().length > 0 && status !== "submitted" && status !== "streaming";
  const inputDisabled = status === "submitted" || status === "streaming";

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Ask Harsh's AI chat"
      onTransitionEnd={handleTransitionEnd}
      className={`${PANEL_CLASSES} ${visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-ink">Ask Harsh&rsquo;s AI</h2>
          <span className="rounded-full border border-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
            AI
          </span>
        </div>
        <button
          type="button"
          onClick={onRequestClose}
          aria-label="Close"
          className="rounded-full p-1 text-lg leading-none text-ink-muted outline-none transition-colors duration-fast ease-out-expo hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ×
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-ink-muted">
              Hi — I&rsquo;m Harsh&rsquo;s AI. Ask me about his work.
            </p>
            <div className="flex flex-wrap gap-2">
              {starters.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => handleStarterClick(starter)}
                  className="rounded-full border border-surface px-3 py-1.5 text-left font-mono text-xs text-ink-muted outline-none transition-colors duration-base ease-out-expo hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const text = getMessageText(message);
            if (message.role === "user") {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-lg bg-surface px-4 py-2 text-sm text-ink">
                    {text}
                  </div>
                </div>
              );
            }
            return (
              <div key={message.id} className="max-w-[90%] whitespace-pre-wrap text-sm text-ink">
                {text}
              </div>
            );
          })
        )}

        {showStreamingDot && (
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent motion-reduce:animate-none"
          />
        )}

        {friendlyError && <p className="text-xs text-ink-muted">{friendlyError}</p>}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about Harsh's work..."
            disabled={inputDisabled}
            className="flex-1 rounded-full border border-surface bg-transparent px-4 py-2 text-sm text-ink outline-none transition-colors duration-base ease-out-expo placeholder:text-ink-muted focus-visible:border-accent disabled:opacity-60"
          />
          {status === "streaming" ? (
            <button type="button" onClick={() => void stop()} className={PILL_BUTTON_CLASSES}>
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSend}
              className={`${PILL_BUTTON_CLASSES} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              Send
            </button>
          )}
        </div>
        <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          AI answers from Harsh&rsquo;s verified work history — for anything important, email him.
        </p>
      </form>
    </div>
  );
}
