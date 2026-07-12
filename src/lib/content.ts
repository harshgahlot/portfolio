/**
 * Single source of truth for site copy. Every section (and later the S4
 * chatbot corpus) pulls from here instead of hardcoding strings, so facts
 * only ever need to change in one place.
 *
 * Real, verified facts only — see AGENTS.md. Never invent metrics.
 */

export const NAME = "Harsh Gahlot";

export type Identity = {
  label: string;
  line: string;
};

export const identities: { backend: Identity; ai: Identity } = {
  backend: {
    label: "BACKEND ENGINEER",
    line: "Java · Spring Boot · 20+ microservices in production",
  },
  ai: {
    label: "APPLIED AI",
    line: "RAG · LangChain · hackathon-winning AI assistant",
  },
};

export type Metric = {
  value: string;
  label: string;
};

export const metrics: Metric[] = [
  { value: "20+", label: "production microservices maintained" },
  { value: "7+", label: "services built and shipped" },
  { value: "6,000+", label: "enterprise users served" },
  { value: "2nd", label: "place, company-wide AI hackathon" },
];

export const about: string =
  "I'm a backend engineer at Mindsprint, where two-plus years building and maintaining production microservices earned me a promotion to Software Engineer, with a bonus, in April 2026. Java and Spring Boot are my core, but I've spent the last year pushing into applied AI — building a RAG assistant that took 2nd place in a company-wide hackathon. I like systems that hold up under real usage, whichever layer they live in.";

export type Links = {
  github: string;
  linkedin: string;
  email: string;
  resume: string;
};

export const links: Links = {
  github: "https://github.com/harshgahlot",
  linkedin: "https://www.linkedin.com/in/h-gahlot",
  email: "harsh09gahlot@gmail.com",
  resume: "/Harsh_Gahlot_Resume.pdf",
};
