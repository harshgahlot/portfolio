import { ImageResponse } from "next/og";
import { allWorks } from "content-collections";
import { OgImage, OG_SIZE } from "@/lib/og-image";

export const alt = "Harsh Gahlot — Work";
export const size = OG_SIZE;
export const contentType = "image/png";

function getWork(slug: string) {
  return allWorks.find((work) => work.slug === slug && !work.draft);
}

// Mirrors page.tsx's generateStaticParams — opengraph-image is its own
// Route Handler for this segment, so it needs its own static params to be
// generated at build time instead of on demand.
export async function generateStaticParams() {
  return allWorks.filter((work) => !work.draft).map((work) => ({ slug: work.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getWork(slug);

  return new ImageResponse(
    <OgImage eyebrow="Case study" title={work?.title ?? "Work"} section="work" />,
    size
  );
}
