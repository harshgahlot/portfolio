---
title: How this AI assistant works
tags: [site, assistant, rag, meta]
---
You're talking to a RAG pipeline I built into this site. My work history lives as a corpus of hand-written markdown chunks, embedded at build time into a JSON file — no vector database. At query time your question is matched against those chunks (vector similarity when embeddings are live, lexical scoring as a fallback), the top matches go into the prompt as context, and Claude Haiku 4.5 streams the answer through a Next.js route handler using the AI SDK. Rate limiting keeps it affordable. It answers only from my verified work history — the same architecture pattern as my hackathon-winning knowledge assistant, scaled down to one person: me.
