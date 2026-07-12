type CoverArtProps = {
  slug: string;
};

const VIEW_BOX_WIDTH = 400;
const VIEW_BOX_HEIGHT = 300;

/**
 * Shared frame for every motif below: fixed 4/3 canvas, surface-toned
 * background. `width`/`height` (in addition to `viewBox`) give the SVG an
 * intrinsic aspect ratio so the browser can reserve layout space before any
 * CSS loads — no CLS. Sizing itself is controlled by the parent via className
 * (`h-auto w-full`), so this reads sharp from a ~240px hover preview up to a
 * full-width case-study hero.
 */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}
      width={VIEW_BOX_WIDTH}
      height={VIEW_BOX_HEIGHT}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className="block h-auto w-full"
    >
      <rect x="0" y="0" width={VIEW_BOX_WIDTH} height={VIEW_BOX_HEIGHT} className="fill-surface" />
      {children}
    </svg>
  );
}

/** rag-knowledge-assistant: documents fanning into a retrieval node cluster, then out to a single grounded answer. */
function RagArt() {
  const docs = [
    { x: 44, y: 94 },
    { x: 58, y: 116 },
    { x: 72, y: 138 },
  ];
  const nodes = [
    { x: 244, y: 92 },
    { x: 270, y: 128 },
    { x: 248, y: 168 },
    { x: 292, y: 188 },
    { x: 230, y: 208 },
  ];
  const answer = { x: 338, y: 150 };
  const hub = { x: 146, y: 142 };

  return (
    <Frame>
      {docs.map((d, i) => (
        <rect
          key={i}
          x={d.x}
          y={d.y}
          width="72"
          height="92"
          rx="3"
          className="fill-surface stroke-ink-muted"
          strokeWidth="1.5"
        />
      ))}
      {nodes.map((n, i) => (
        <line
          key={`line-${i}`}
          x1={hub.x}
          y1={hub.y}
          x2={n.x}
          y2={n.y}
          className="stroke-ink-muted/60"
          strokeWidth="1"
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={`node-${i}`}
          cx={n.x}
          cy={n.y}
          r="5"
          className="fill-surface stroke-ink-muted"
          strokeWidth="1.5"
        />
      ))}
      <line x1="272" y1="148" x2={answer.x} y2={answer.y} className="stroke-accent" strokeWidth="1.5" />
      <circle cx={answer.x} cy={answer.y} r="9" className="fill-accent" />
    </Frame>
  );
}

/** vehicle-location-system: a dotted route across a faint map grid, ending at a live position marker. */
function VlsArt() {
  const verticals = [60, 140, 220, 300, 360];
  const horizontals = [50, 110, 170, 230, 270];
  const route = "M 60,230 L 60,170 L 140,170 L 140,110 L 220,110 L 220,60 L 300,60 L 300,110 L 360,110";
  const markers = [
    { x: 60, y: 230 },
    { x: 140, y: 170 },
    { x: 220, y: 110 },
    { x: 300, y: 60 },
  ];
  const current = { x: 360, y: 110 };

  return (
    <Frame>
      {verticals.map((x) => (
        <line key={`v${x}`} x1={x} y1="30" x2={x} y2="270" className="stroke-ink-muted/25" strokeWidth="1" />
      ))}
      {horizontals.map((y) => (
        <line key={`h${y}`} x1="30" y1={y} x2="370" y2={y} className="stroke-ink-muted/25" strokeWidth="1" />
      ))}
      <path
        d={route}
        fill="none"
        className="stroke-ink"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 9"
      />
      {markers.map((m, i) => (
        <circle key={i} cx={m.x} cy={m.y} r="4" className="fill-surface stroke-ink" strokeWidth="1.5" />
      ))}
      <circle cx={current.x} cy={current.y} r="7" className="fill-accent" />
    </Frame>
  );
}

/** iraf-2-0: an access-control lattice — a grid of cells with a few keyed/highlighted. */
function IrafArt() {
  const cols = 8;
  const rows = 5;
  const cell = 40;
  const gap = 5;
  const originX = 40;
  const originY = 50;
  const keyed = new Set(["1,1", "2,4", "3,2", "4,0", "0,6"]);

  const cells: { r: number; c: number; key: string }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ r, c, key: `${r},${c}` });
    }
  }

  return (
    <Frame>
      {cells.map(({ r, c, key }) => {
        const isKeyed = keyed.has(key);
        return (
          <rect
            key={key}
            x={originX + c * cell + gap / 2}
            y={originY + r * cell + gap / 2}
            width={cell - gap}
            height={cell - gap}
            rx="2"
            className={isKeyed ? "fill-accent" : "fill-surface stroke-ink-muted/50"}
            strokeWidth={isKeyed ? undefined : 1}
          />
        );
      })}
    </Frame>
  );
}

/** agripal: field rows with a single leaf silhouette cut out of them. */
function AgripalArt() {
  const rows = [70, 106, 142, 178, 214, 250];

  return (
    <Frame>
      {rows.map((y, i) => (
        <line key={i} x1="40" y1={y} x2="360" y2={y} className="stroke-ink-muted/40" strokeWidth="1.5" />
      ))}
      <path
        d="M 220,84 Q 268,150 220,216 Q 172,150 220,84 Z"
        className="fill-surface stroke-accent"
        strokeWidth="2"
      />
      <line x1="220" y1="92" x2="220" y2="208" className="stroke-accent" strokeWidth="1" />
    </Frame>
  );
}

/** Fallback for an unknown slug: neutral dot grid, no accent. */
function NeutralArt() {
  const cols = 9;
  const rows = 6;
  const stepX = (360 - 40) / (cols - 1);
  const stepY = (250 - 50) / (rows - 1);
  const dots: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({ x: 40 + c * stepX, y: 50 + r * stepY });
    }
  }

  return (
    <Frame>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="2.5" className="fill-ink-muted/50" />
      ))}
    </Frame>
  );
}

/**
 * Inline SVG "cover" art for a work item — used both as the homepage hover
 * preview and the case-study hero image, so all motifs share one visual
 * family (surface background, consistent stroke weight, accent used
 * sparingly, generous whitespace). Purely decorative: aria-hidden.
 */
export function CoverArt({ slug }: CoverArtProps) {
  switch (slug) {
    case "rag-knowledge-assistant":
      return <RagArt />;
    case "vehicle-location-system":
      return <VlsArt />;
    case "iraf-2-0":
      return <IrafArt />;
    case "agripal":
      return <AgripalArt />;
    default:
      return <NeutralArt />;
  }
}
