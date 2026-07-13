/**
 * Shared building block for every dynamic OG image (S5): root, /blog/[slug],
 * /work/[slug]. `ImageResponse` (Satori) renders in an isolated runtime with
 * no access to the site's CSS, so the `@theme` tokens from globals.css are
 * re-declared here as resolved hex values — keep these in sync by hand if
 * the palette in globals.css ever changes.
 */

// Mirrors src/app/globals.css `@theme` — Satori can't read CSS custom
// properties, so the resolved values are hardcoded here.
export const OG_COLORS = {
  bg: "#0e0f12",
  surface: "#16181d",
  ink: "#edeef0",
  inkMuted: "#9ba0ab",
  accent: "#d9f24f",
} as const;

export const OG_SIZE = { width: 1200, height: 630 };

export function OgImage({
  eyebrow,
  title,
  section,
}: {
  /** Small accent-colored label above the title, e.g. "Writing" or "Case study". */
  eyebrow: string;
  /** Main heading — post/work title, or "Harsh Gahlot" for the site default. */
  title: string;
  /** Marker segment after the wordmark, e.g. "blog" or "work". Omit for the site default. */
  section?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: OG_COLORS.bg,
        padding: "80px",
        fontFamily: '"Arial", "Helvetica", sans-serif',
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: OG_COLORS.accent,
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          display: "flex",
          fontSize: title.length > 40 ? 64 : 80,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: -2,
          color: OG_COLORS.ink,
          maxWidth: "1000px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `2px solid ${OG_COLORS.surface}`,
          paddingTop: "32px",
          fontSize: 26,
        }}
      >
        <div style={{ display: "flex", color: OG_COLORS.ink, fontWeight: 600 }}>
          Harsh Gahlot
        </div>
        {section ? (
          <div
            style={{
              display: "flex",
              color: OG_COLORS.inkMuted,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {`/ ${section}`}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              color: OG_COLORS.inkMuted,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Backend × Applied AI
          </div>
        )}
      </div>
    </div>
  );
}
