import { ImageResponse } from "next/og";
import { allPosts } from "content-collections";
import { OgImage, OG_SIZE } from "@/lib/og-image";

export const alt = "Harsh Gahlot — Blog";
export const size = OG_SIZE;
export const contentType = "image/png";

function getPost(slug: string) {
  return allPosts.find((post) => post.slug === slug && !post.draft);
}

// Mirrors page.tsx's generateStaticParams — opengraph-image is its own
// Route Handler for this segment, so it needs its own static params to be
// generated at build time instead of on demand.
export async function generateStaticParams() {
  return allPosts.filter((post) => !post.draft).map((post) => ({ slug: post.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  return new ImageResponse(
    <OgImage eyebrow="Writing" title={post?.title ?? "Blog"} section="blog" />,
    size
  );
}
