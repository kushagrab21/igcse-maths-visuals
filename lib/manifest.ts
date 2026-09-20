/**
 * Typed loader for manifest.json — the single source of truth for what the
 * site contains. `scripts/build-manifest.mjs` writes that file from
 * lib/copy.ts and content/*.json; nothing here is hand-edited.
 */

import data from "../manifest.json";
import briefs from "../content/briefs.json";

export type VizKind = "2d" | "3d";
export type VizStatus = "ready" | "coming-soon";
export type GlyphName =
  | "triangle"
  | "cuboid"
  | "compass"
  | "height"
  | "odd"
  | "dissection"
  | "power"
  | "log";

export type PracticeSet = {
  label: string;
  /** Site-relative path under public/, e.g. `library/bearings/…_QUESTIONS.pdf`. */
  qp: string;
  qp_bytes: number;
  ms: string;
  ms_bytes: number;
};

export type Sheet = {
  /** Source id, e.g. `T04`. */
  id: string;
  /** Printed sheet number, 1–30. */
  number: number;
  strand: string;
  title: string;
  /** The page of The Doubt Book PDF this sheet opens on. */
  page: number;
};

export type Viz = {
  status: VizStatus;
  title: string;
  kind: VizKind;
  /** Site-relative, trailing slash, e.g. `viz/visual-proof/`. */
  path: string;
};

export type Topic = {
  slug: string;
  title: string;
  /** Key into `manifest.documents`. */
  document: string;
  glyph: GlyphName;
  blurb: string;
  /** Key into content/briefs.json. */
  brief: string;
  practice: PracticeSet[];
  sheets: Sheet[];
  viz: Viz;
};

export type Manifest = {
  site: { title: string };
  documents: Record<string, string>;
  topics: Topic[];
  library: {
    doubt_book: {
      path: string;
      bytes: number;
      pages: number;
      sheets: Sheet[];
    };
  };
};

export const manifest = data as Manifest;
export const doubtBook = manifest.library.doubt_book;

/** Topics in the notes' own order. */
export const topics = manifest.topics;

export function topicBySlug(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}

/** The document a topic belongs to, as a reader-facing name. */
export function documentName(topic: Topic): string {
  return manifest.documents[topic.document] ?? topic.document;
}

/** The rendered HTML of a topic's method brief. */
export function briefHtml(topic: Topic): string {
  return (briefs as Record<string, string>)[topic.brief] ?? "";
}

/** Topics whose visualisation a reader can open today. */
export function readyTopics(): Topic[] {
  return topics.filter((t) => t.viz.status === "ready");
}

/** The topic a Doubt Book sheet belongs to, or undefined (sheet 1 has none). */
export function topicForSheet(id: string): Topic | undefined {
  return topics.find((t) => t.sheets.some((s) => s.id === id));
}

/**
 * The deployment's base path (`/igcse-maths-visuals` on GitHub Pages, `""` at
 * a custom-domain root). Next rewrites `<Link>` for us; a raw `<a href>` to a
 * file under public/ has to be prefixed by hand.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Absolute, base-path-aware href for a file under public/. */
export function asset(p: string): string {
  return `${BASE_PATH}/${p.replace(/^\/+/, "")}`;
}

/** "1.9 MB" — for a link that is about to download something. */
export function fileSize(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} kB`;
}
