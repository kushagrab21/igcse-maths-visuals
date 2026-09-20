/**
 * The 64×64 cover tile that stands in front of each topic row — the shelf
 * needs something to look at where Tome has a book cover.
 *
 * One glyph per topic, drawn from the thing the topic is actually about: the
 * two arcs of the ambiguous case, the cuboid's space diagonal, a north line,
 * a dropped perpendicular, 2n+1, a dissected square, aˣ, log.
 *
 * Stroke is `currentColor`, so the parent decides the colour and Tome's
 * accent-soft → accent hover flip works without touching this file.
 */

import type { GlyphName } from "../lib/manifest";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const TEXT = {
  fill: "currentColor",
  textAnchor: "middle" as const,
  dominantBaseline: "central" as const,
  fontFamily: "var(--font-serif), Georgia, serif",
  fontStyle: "italic" as const,
};

const GLYPHS: Record<GlyphName, React.ReactNode> = {
  // Ambiguous case — one angle, one fixed side, and the arc that can cut the
  // base twice, once or not at all.
  triangle: (
    <>
      <path d="M8 26 L30 6 L30 26 Z" {...STROKE} />
      <path d="M8 26 H30" {...STROKE} />
      <path d="M22 26 A 8.5 8.5 0 0 1 30 17.5" {...STROKE} strokeDasharray="2 2.2" />
      <path d="M12 26 L12 22.5" {...STROKE} strokeWidth={1.2} />
    </>
  ),
  // 3D trigonometry — a cuboid with its space diagonal.
  cuboid: (
    <>
      <path d="M7 12 H23 V26 H7 Z" {...STROKE} />
      <path d="M7 12 L13 6 H29 L23 12" {...STROKE} />
      <path d="M23 26 L29 20 V6" {...STROKE} />
      <path d="M7 26 L29 6" {...STROKE} strokeWidth={2} />
    </>
  ),
  // Bearings — a north line and an angle swept clockwise from it.
  compass: (
    <>
      <circle cx="18" cy="17" r="10" {...STROKE} />
      <path d="M18 4 V17" {...STROKE} />
      <path d="M18 17 L26.5 22" {...STROKE} strokeWidth={2} />
      <path d="M18 9 A 8 8 0 0 1 24.9 13" {...STROKE} strokeWidth={1.2} strokeDasharray="1.8 2" />
      <path d="M15.6 6.5 L18 3.5 L20.4 6.5" {...STROKE} />
    </>
  ),
  // Area / sine rule / cosine rule — the one dropped perpendicular.
  height: (
    <>
      <path d="M6 26 L16 7 L30 26 Z" {...STROKE} />
      <path d="M16 7 V26" {...STROKE} strokeDasharray="2.4 2.4" strokeWidth={2} />
      <path d="M16 22.5 H19.5 V26" {...STROKE} strokeWidth={1.2} />
    </>
  ),
  // Algebraic proof — the representation everything starts from.
  odd: (
    <text x="18" y="17" fontSize="13" fontWeight={600} {...TEXT}>
      2n+1
    </text>
  ),
  // Visual proof — a square cut into a², ab, ab, b².
  dissection: (
    <>
      <path d="M6 6 H30 V30 H6 Z" {...STROKE} />
      <path d="M22 6 V30 M6 22 H30" {...STROKE} />
      <path d="M6 6 H22 V22 H6 Z" fill="currentColor" opacity={0.16} stroke="none" />
      <path d="M22 22 H30 V30 H22 Z" fill="currentColor" opacity={0.16} stroke="none" />
    </>
  ),
  // Exponents.
  power: (
    <text x="18" y="18" fontSize="17" fontWeight={600} {...TEXT}>
      a
      <tspan fontSize="11" dy="-6">
        x
      </tspan>
    </text>
  ),
  // Logarithms.
  log: (
    <text x="18" y="17" fontSize="13" fontWeight={600} {...TEXT}>
      log
    </text>
  ),
};

export function TopicGlyph({ name }: { name: GlyphName }) {
  return (
    <svg viewBox="0 0 36 36" width="100%" height="100%" aria-hidden focusable="false">
      {GLYPHS[name]}
    </svg>
  );
}
