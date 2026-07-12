/**
 * Starter-chip prompts for the assistant panel's empty state, chosen by the
 * current route so the suggestions feel relevant to whatever the visitor is
 * already reading. Pure function — easy to unit test, no client-only APIs.
 */
export function getStarters(pathname: string): string[] {
  if (pathname.startsWith("/work/rag")) {
    return [
      "Explain this architecture simply",
      "Why retrieval instead of fine-tuning?",
      "What was the hackathon result?",
    ];
  }

  if (pathname.startsWith("/work/vehicle")) {
    return [
      "What made VLS hard?",
      "How were the read APIs designed?",
      "What stack does Harsh use for backend work?",
    ];
  }

  if (pathname === "/" || pathname === "") {
    return [
      "What does Harsh actually build?",
      "Tell me about the hackathon win",
      "Is Harsh open to new roles?",
    ];
  }

  // /craft, other /work/* pages, and anything else.
  return [
    "How was this site built?",
    "How does this assistant work?",
    "How do I contact Harsh?",
  ];
}
