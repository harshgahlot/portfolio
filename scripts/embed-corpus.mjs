#!/usr/bin/env node
/**
 * Build-time embedding pipeline for the "Ask Harsh's AI" corpus (Sprint 4).
 *
 * Reads every `content/assistant/*.md` file, hand-parses its frontmatter
 * (no gray-matter dependency — the corpus files use a fixed, simple shape),
 * and writes `src/lib/assistant/corpus.json`.
 *
 * If VOYAGE_API_KEY is set, every chunk is embedded in a single batched
 * request to Voyage AI (voyage-4-lite) and vector retrieval lights up at
 * query time. If it isn't set, embeddings are written as `null` and
 * retrieval falls back to lexical (BM25-flavored) scoring — the corpus is
 * still fully usable with zero API keys.
 *
 * Safe to re-run at any time; this is the only place corpus.json is produced.
 *
 * Usage: node scripts/embed-corpus.mjs   (or `npm run embed`)
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content", "assistant");
const OUTPUT_PATH = path.join(ROOT, "src", "lib", "assistant", "corpus.json");
const VOYAGE_MODEL = "voyage-4-lite";
const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";

/**
 * Minimal hand-rolled frontmatter parser. Every corpus file follows a fixed
 * shape: a `---` fence, a `title:` line, a `tags: [a, b]` line, a closing
 * `---` fence, then the chunk body — so a full YAML parser (or a
 * gray-matter dependency) would be overkill. Splits on the fences, then
 * reads `title:`/`tags:` lines out of the frontmatter block.
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    // No frontmatter fence found — treat the whole file as body text.
    return { title: "", tags: [], text: raw.trim() };
  }

  const [, frontmatter, body] = match;
  let title = "";
  let tags = [];

  for (const line of frontmatter.split(/\r?\n/)) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key === "title") {
      title = value;
    } else if (key === "tags") {
      tags = value
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
  }

  return { title, tags, text: body.trim() };
}

async function loadChunks() {
  const entries = await readdir(CONTENT_DIR);
  const files = entries.filter((f) => f.endsWith(".md")).sort();

  const chunks = [];
  for (const file of files) {
    const raw = await readFile(path.join(CONTENT_DIR, file), "utf8");
    const { title, tags, text } = parseFrontmatter(raw);
    chunks.push({
      id: path.basename(file, ".md"),
      title,
      tags,
      text,
    });
  }
  return chunks;
}

/** Batch-embeds every chunk's text in a single Voyage AI request. */
async function embedChunks(chunks, apiKey) {
  const response = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: chunks.map((chunk) => chunk.text),
      input_type: "document",
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Voyage embeddings request failed: ${response.status} ${response.statusText} ${body}`
    );
  }

  const json = await response.json();
  const embeddingByIndex = new Map(
    (json.data ?? []).map((item) => [item.index, item.embedding])
  );

  return chunks.map((chunk, index) => ({
    ...chunk,
    embedding: embeddingByIndex.get(index) ?? null,
  }));
}

/**
 * True when the existing corpus.json on disk was built from exactly the
 * current markdown chunks (same ids, same text). Used to avoid clobbering
 * an embedded corpus with a lexical one on keyless machines.
 */
async function existingCorpusMatches(chunks) {
  try {
    const existing = JSON.parse(await readFile(OUTPUT_PATH, "utf8"));
    if (!Array.isArray(existing.chunks)) return false;
    if (existing.chunks.length !== chunks.length) return false;
    const byId = new Map(existing.chunks.map((c) => [c.id, c.text]));
    return chunks.every((chunk) => byId.get(chunk.id) === chunk.text);
  } catch {
    return false;
  }
}

async function main() {
  const chunks = await loadChunks();
  const apiKey = process.env.VOYAGE_API_KEY;

  let model = null;
  let embeddedChunks;

  if (apiKey) {
    console.log(
      `[embed-corpus] Embedding ${chunks.length} chunks with Voyage (${VOYAGE_MODEL})...`
    );
    try {
      embeddedChunks = await embedChunks(chunks, apiKey);
      model = VOYAGE_MODEL;
      console.log("[embed-corpus] Embeddings written — vector retrieval is live.");
    } catch (error) {
      // This runs as `prebuild` on Vercel: a Voyage outage or bad key must
      // degrade to lexical retrieval, never fail the deploy.
      console.warn(
        "[embed-corpus] Voyage embedding failed — falling back to lexical corpus:",
        error?.message ?? error
      );
      embeddedChunks = chunks.map((chunk) => ({ ...chunk, embedding: null }));
    }
  } else {
    // No key on this machine. If the committed corpus.json already reflects
    // the current markdown (e.g. it was embedded on Vercel or by a teammate),
    // leave it alone rather than downgrading it to a lexical one.
    if (await existingCorpusMatches(chunks)) {
      console.log(
        "[embed-corpus] no VOYAGE_API_KEY and corpus.json already matches the " +
          "current chunks — leaving it untouched."
      );
      return;
    }
    embeddedChunks = chunks.map((chunk) => ({ ...chunk, embedding: null }));
    console.log(
      "[embed-corpus] wrote corpus without embeddings — lexical retrieval will be used; " +
        "set VOYAGE_API_KEY and re-run to enable vector retrieval."
    );
  }

  const corpus = {
    model,
    generatedAt: new Date().toISOString(),
    chunks: embeddedChunks,
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(corpus, null, 2) + "\n", "utf8");
  console.log(
    `[embed-corpus] wrote ${embeddedChunks.length} chunks to ${path.relative(ROOT, OUTPUT_PATH)}`
  );
}

main().catch((error) => {
  console.error("[embed-corpus] failed:", error);
  process.exitCode = 1;
});
