/**
 * Server-only retrieval for "Ask Harsh's AI" (Sprint 4).
 *
 * Pure and dependency-free: static-imports the build-time corpus.json and
 * scores it in memory — no vector DB, no runtime file I/O. Two modes:
 *
 *  - Vector: only when every chunk was embedded at build time AND
 *    VOYAGE_API_KEY is set at runtime. The query is embedded with the same
 *    Voyage endpoint (input_type: "query") and scored by cosine similarity.
 *    Any failure at runtime (network, bad key, non-200) falls through to
 *    lexical — this function never throws.
 *  - Lexical: a small BM25-flavored scorer (term frequency over chunk
 *    text + title, title matches weighted higher, normalized by length).
 *    This is also the permanent mode when the corpus was built without an
 *    embedding key (see scripts/embed-corpus.mjs).
 */
import corpusData from "./corpus.json";

export type Chunk = {
  id: string;
  title: string;
  tags: string[];
  text: string;
  embedding: number[] | null;
};

type Corpus = {
  model: string | null;
  generatedAt: string;
  chunks: Chunk[];
};

const corpus = corpusData as Corpus;

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-4-lite";

// A small inline stopword list — enough to keep the lexical scorer from
// being swamped by function words, without pulling in a dependency.
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "so", "of", "in",
  "on", "at", "by", "for", "to", "from", "with", "about", "as", "is",
  "are", "was", "were", "be", "been", "being", "it", "its", "this",
  "that", "these", "those", "i", "you", "he", "she", "they", "we",
  "do", "does", "did", "can", "could", "will", "would", "should",
  "what", "how", "why", "who", "which", "your", "my", "his", "her",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));
}

/**
 * BM25-flavored lexical score for a single chunk against a tokenized query.
 * Exported for testability. Sums term-frequency matches across the chunk's
 * title (weighted x2) and body text, normalized by chunk length so long
 * chunks don't win purely on size.
 */
export function scoreChunkLexically(queryTokens: string[], chunk: Chunk): number {
  if (queryTokens.length === 0) return 0;

  const titleTokens = tokenize(chunk.title);
  const bodyTokens = tokenize(chunk.text);
  const lengthNorm = Math.sqrt(bodyTokens.length + titleTokens.length) || 1;

  let score = 0;
  for (const queryToken of queryTokens) {
    const titleHits = titleTokens.filter((t) => t === queryToken).length;
    const bodyHits = bodyTokens.filter((t) => t === queryToken).length;
    score += (titleHits * 2 + bodyHits) / lengthNorm;
  }

  return score;
}

function lexicalRetrieve(query: string, k: number): Chunk[] {
  const queryTokens = tokenize(query);

  const scored = corpus.chunks
    .map((chunk) => ({ chunk, score: scoreChunkLexically(queryTokens, chunk) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored.slice(0, k).map(({ chunk }) => chunk);
  }

  // Nothing scored — fall back to a safe default so the assistant always
  // has *something* grounded to answer from.
  const safeDefault = corpus.chunks.filter(
    (chunk) => chunk.tags.includes("bio") || chunk.tags.includes("overview")
  );
  return safeDefault.slice(0, k);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function embedQuery(query: string, apiKey: string): Promise<number[] | null> {
  const response = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: [query],
      input_type: "query",
    }),
  });

  if (!response.ok) return null;

  const json = await response.json();
  const embedding = json?.data?.[0]?.embedding;
  return Array.isArray(embedding) ? embedding : null;
}

function vectorRetrieve(queryEmbedding: number[], k: number): Chunk[] {
  const scored = corpus.chunks
    .filter((chunk) => chunk.embedding !== null)
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding as number[]),
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, k).map(({ chunk }) => chunk);
}

const allChunksEmbedded = corpus.chunks.every((chunk) => chunk.embedding !== null);

/**
 * Retrieve the top-k most relevant chunks for a query. Never throws — any
 * runtime failure in the vector path falls through to lexical scoring.
 */
export async function retrieve(query: string, k = 5): Promise<Chunk[]> {
  const apiKey = process.env.VOYAGE_API_KEY;

  if (allChunksEmbedded && apiKey) {
    try {
      const queryEmbedding = await embedQuery(query, apiKey);
      if (queryEmbedding) {
        return vectorRetrieve(queryEmbedding, k);
      }
    } catch {
      // Fall through to lexical — retrieval must never throw.
    }
  }

  return lexicalRetrieve(query, k);
}
