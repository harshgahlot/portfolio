import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";

const nextConfig: NextConfig = {
  /* config options here */
};

// withContentCollections runs the content-collections builder as a side
// effect during `next dev`/`next build` and returns the config unchanged —
// it doesn't touch webpack config, so it works fine under Turbopack (the
// Next 16 default). Confirmed via @content-collections/next's own CHANGELOG
// ("Add support for Next.js 16", "Support for turbopack").
export default withContentCollections(nextConfig);
