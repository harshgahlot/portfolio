---
title: RAG Knowledge Assistant — architecture
tags: [projects, rag, architecture]
---
The hackathon RAG pipeline splits into an index side and a query side. Index side: ingest and normalize semi-structured enterprise documents, chunk them in a structure-aware way (split blindly and a table row loses its header), embed each chunk, and write it to a vector index. Query side: embed the question into the same vector space, retrieve the top-k closest chunks, assemble a prompt with one standing instruction — answer from this context and only this context — and generate. When retrieval comes back thin, the honest move is "I don't know." LangChain orchestrates the flow.
