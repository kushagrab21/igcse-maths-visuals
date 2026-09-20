/**
 * Typed loader for manifest.json — the single source of truth for what this
 * site contains. Everything else (the index grid, the /viz/[slug] routes, the
 * build checks) reads it through here, so adding a page means editing one
 * JSON file.
 *
 * The import is a build-time `resolveJsonModule` import: the manifest is
 * baked into the static export, never fetched.
 */

import data from "../manifest.json";

export type VizKind = "2d" | "3d";
export type VizStatus = "ready" | "coming-soon";

export type Topic = {
  slug: string;
  title: string;
};

export type Document = {
  id: string;
  title: string;
  topics: Topic[];
};

export type Visualisation = {
  id: string;
  topic: string;
  title: string;
  blurb: string;
  /** Site-relative, with a trailing slash, e.g. `viz/visual-proof/`. */
  path: string;
  kind: VizKind;
  /** Photo stems this page was built from, e.g. `IMG_0256`. */
  source_pages: string[];
  status: VizStatus;
};

export type Manifest = {
  site: { title: string; subtitle: string };
  documents: Document[];
  visualisations: Visualisation[];
};

export const manifest = data as Manifest;

/** Every visualisation for a topic slug, in manifest order. */
export function vizForTopic(slug: string): Visualisation[] {
  return manifest.visualisations.filter((v) => v.topic === slug);
}

/** One visualisation by id, or undefined. */
export function vizById(id: string): Visualisation | undefined {
  return manifest.visualisations.find((v) => v.id === id);
}

/** The document a topic slug belongs to, or undefined. */
export function documentForTopic(slug: string): Document | undefined {
  return manifest.documents.find((d) => d.topics.some((t) => t.slug === slug));
}

/** A topic by slug, or undefined. */
export function topicBySlug(slug: string): Topic | undefined {
  for (const d of manifest.documents) {
    const t = d.topics.find((x) => x.slug === slug);
    if (t) return t;
  }
  return undefined;
}

/** Visualisations a reader can actually open today. */
export function readyVisualisations(): Visualisation[] {
  return manifest.visualisations.filter((v) => v.status === "ready");
}

/**
 * The deployment's base path (`/igcse-maths-visuals` on GitHub Pages, `""` at
 * a custom-domain root). Next rewrites `<Link>` and `<Image>` for us, but raw
 * `<a href>` to a file under public/ has to be prefixed by hand.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Absolute, base-path-aware href for a path under public/. */
export function asset(p: string): string {
  return `${BASE_PATH}/${p.replace(/^\/+/, "")}`;
}
