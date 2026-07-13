import { ImageResponse } from "next/og";
import { OgImage, OG_SIZE } from "@/lib/og-image";

export const alt = "Harsh Gahlot — Software Engineer, Backend × Applied AI";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgImage eyebrow="Software Engineer" title="Harsh Gahlot" />,
    size
  );
}
