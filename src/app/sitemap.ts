import type { MetadataRoute } from "next";
import { allPosts, allWorks } from "content-collections";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/craft`, changeFrequency: "monthly", priority: 0.4 },
  ];

  // Draft posts/works are stubs with no live page (dynamicParams = false on
  // both [slug] routes 404s them) — exclude them from the sitemap too.
  const postRoutes: MetadataRoute.Sitemap = allPosts
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${SITE_URL}${post.url}`,
      lastModified: post.date,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const workRoutes: MetadataRoute.Sitemap = allWorks
    .filter((work) => !work.draft)
    .map((work) => ({
      url: `${SITE_URL}${work.url}`,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [...staticRoutes, ...workRoutes, ...postRoutes];
}
