import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Blanket allow for every user agent, including AI crawlers (GPTBot,
// ClaudeBot, etc.) — deliberate per the S5 plan, not an oversight.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
