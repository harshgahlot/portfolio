---
title: Why retrieval instead of fine-tuning
tags: [projects, rag, design-decisions]
---
People ask why I built the knowledge assistant on retrieval rather than fine-tuning. Fine-tuning bakes knowledge into model weights: expensive to update, impossible to cite. Retrieval keeps the documents as the source of truth — re-index and the assistant is current, and every answer can point back to where it came from. For enterprise knowledge that changes constantly, that's the whole game. The impact: employees could ask questions in natural language, cutting the manual knowledge-lookup effort that motivated the build.
