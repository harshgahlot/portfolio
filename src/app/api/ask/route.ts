import { NextRequest, NextResponse } from "next/server";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { retrieve } from "@/lib/assistant/retrieval";
import { SYSTEM_PROMPT } from "@/lib/assistant/prompt";

export const maxDuration = 30;

// ---------------------------------------------------------------------------
// Rate limiting setup (module scope — runs once per server instance).
//
// Three limiters share one Redis instance: a 10/60s sliding window per IP,
// a 100/day fixed window per IP, and a 1000/day fixed window across the
// whole site ("global"). If Upstash isn't configured (no keys in this
// environment yet), rate limiting is skipped entirely and a single warning
// is logged — the assistant still works, just without abuse protection.
// ---------------------------------------------------------------------------
const upstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

let redis: Redis | null = null;
let slidingWindowLimiter: Ratelimit | null = null;
let dailyIpLimiter: Ratelimit | null = null;
let dailyGlobalLimiter: Ratelimit | null = null;

if (upstashConfigured) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  });

  slidingWindowLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "ask:rl:sliding",
  });

  dailyIpLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(100, "1 d"),
    prefix: "ask:rl:daily:ip",
  });

  dailyGlobalLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(1000, "1 d"),
    prefix: "ask:rl:daily:global",
  });
} else {
  console.warn(
    "[api/ask] Upstash env vars are missing — rate limiting is disabled."
  );
}

// ---------------------------------------------------------------------------
// Request-shape helpers. The client sends UIMessage-wire-shaped objects
// ({ role, parts: [{ type: "text", text }] }); we validate loosely rather
// than trusting the full AI SDK UIMessage type, since this is a JSON
// boundary that also has to accept hand-written curl bodies.
// ---------------------------------------------------------------------------
type IncomingUIMessage = {
  id?: string;
  role: unknown;
  parts?: Array<{ type?: unknown; text?: unknown }>;
};

function isValidRole(role: unknown): role is "user" | "assistant" {
  return role === "user" || role === "assistant";
}

function extractText(message: IncomingUIMessage): string {
  if (!Array.isArray(message.parts)) return "";
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } =>
        !!part && part.type === "text" && typeof part.text === "string"
    )
    .map((part) => part.text)
    .join("");
}

function getLatestUserText(messages: IncomingUIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      return extractText(messages[i]);
    }
  }
  return "";
}

/** First IP in x-forwarded-for, falling back to "anonymous". */
function getClientIdentifier(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const first = forwardedFor?.split(",")[0]?.trim();
  return first || "anonymous";
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    if (
      !body ||
      typeof body !== "object" ||
      !Array.isArray((body as { messages?: unknown }).messages)
    ) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const messages = (body as { messages: IncomingUIMessage[] }).messages;

    for (const message of messages) {
      if (!message || !isValidRole(message.role)) {
        return NextResponse.json({ error: "invalid_request" }, { status: 400 });
      }
      // Cap EVERY message, not just the latest — otherwise oversized text
      // smuggled into earlier history messages inflates input-token cost on
      // each request (the history is resent every turn).
      if (extractText(message).length > 1000) {
        return NextResponse.json({ error: "too_long" }, { status: 400 });
      }
    }

    const latestUserText = getLatestUserText(messages).trim();
    if (latestUserText.length === 0) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    // No Anthropic key: degrade gracefully. In development, also prove out
    // retrieval end-to-end (titles of the chunks that would have been used)
    // so the pipeline can be verified with zero API keys.
    if (!process.env.ANTHROPIC_API_KEY) {
      if (process.env.NODE_ENV === "development") {
        const retrieved = await retrieve(latestUserText, 5);
        return NextResponse.json(
          { error: "offline", retrieved: retrieved.map((chunk) => chunk.title) },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: "offline" }, { status: 503 });
    }

    if (slidingWindowLimiter && dailyIpLimiter && dailyGlobalLimiter) {
      const identifier = getClientIdentifier(req);
      const [sliding, dailyIp, dailyGlobal] = await Promise.all([
        slidingWindowLimiter.limit(identifier),
        dailyIpLimiter.limit(identifier),
        dailyGlobalLimiter.limit("global"),
      ]);

      if (!sliding.success || !dailyIp.success || !dailyGlobal.success) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      }
    }

    const trimmedMessages = messages.slice(-8) as unknown as UIMessage[];
    // The Anthropic API requires the first message to be a user turn; an
    // 8-message window over an alternating conversation can land on an
    // assistant message, which would 400 upstream on every 9th+ message.
    while (
      trimmedMessages.length > 0 &&
      (trimmedMessages[0] as { role?: string }).role === "assistant"
    ) {
      trimmedMessages.shift();
    }
    const retrieved = await retrieve(latestUserText, 5);
    const contextBlock = retrieved
      .map((chunk) => `## ${chunk.title}\n${chunk.text}`)
      .join("\n\n");

    const startedAt = Date.now();

    const result = streamText({
      model: anthropic("claude-haiku-4-5"),
      maxOutputTokens: 600,
      system: `${SYSTEM_PROMPT}\n\n<context>\n${contextBlock}\n</context>`,
      messages: await convertToModelMessages(trimmedMessages),
      onFinish: () => {
        const logEntry = {
          type: "ask",
          q: latestUserText.slice(0, 200),
          chunks: retrieved.map((chunk) => chunk.id),
          ms: Date.now() - startedAt,
        };
        console.log(JSON.stringify(logEntry));

        if (redis) {
          const activeRedis = redis;
          activeRedis
            .lpush("ask:log", JSON.stringify(logEntry))
            .then(() => activeRedis.ltrim("ask:log", 0, 499))
            .catch(() => {});
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch {
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
