/**
 * Rebuilds manifest.json from the site's own copy module plus the generated
 * content/*.json, so the three cannot drift.
 *
 *   node scripts/build-manifest.mjs
 *
 * What is hand-maintained here: the topic order, which document each topic
 * belongs to, the glyph name, the sheet map, and each visualisation's status.
 * Everything else — titles, blurbs, file paths, sizes — is pulled in.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = async (p) => JSON.parse(await readFile(path.join(SITE, p), "utf8"));

/** The notes' own order, across both documents. */
const ORDER = [
  ["ambiguous-case", "Ambiguous Case", "essential-math", "triangle"],
  ["3d-trigonometry", "3D Trigonometry", "essential-math", "cuboid"],
  ["bearings", "Bearings", "essential-math", "compass"],
  ["triangle-area-and-rules", "Area of a Triangle, Sine Rule, Cosine Rule", "essential-math", "height"],
  ["algebraic-proof", "Algebraic Proof", "math-plus", "odd"],
  ["visual-proof", "Visual Proof", "math-plus", "dissection"],
  ["exponents", "Exponents", "math-plus", "power"],
  ["logarithms", "Logarithms", "math-plus", "log"],
];

const DOCUMENTS = {
  "essential-math": "G10 UWCE Essential Math",
  "math-plus": "Math Plus",
};

/** Which Doubt Book sheets belong to which topic. */
const SHEETS = {
  "ambiguous-case": ["T04", "T05"],
  "3d-trigonometry": ["T09", "T10"],
  bearings: ["T08"],
  "triangle-area-and-rules": ["T02", "T03", "T06", "T07"],
  "algebraic-proof": ["P11", "P12", "P13", "P14"],
  "visual-proof": ["P15", "P16", "P17"],
  exponents: ["E18", "E19", "E20", "E21", "E22", "E23", "E24"],
  logarithms: ["L25", "L26", "L27", "L28", "L29", "L30"],
};

/** Human labels for each practice row, in the order build-library.py picks them. */
const PRACTICE_LABELS = {
  "ambiguous-case": ["Sine and cosine rule — practice", "Sine rule, cosine rule and area — exam questions"],
  "3d-trigonometry": ["3D trigonometry — practice", "Pythagoras and 3D trigonometry — exam questions"],
  bearings: ["Bearings — practice", "Bearings — exam questions"],
  "triangle-area-and-rules": ["Sine and cosine rule — practice", "Sine rule, cosine rule and area — exam questions"],
  "algebraic-proof": ["Algebraic proof — practice", "Algebraic proof — exam questions"],
  "visual-proof": ["Expanding two brackets — practice", "Expanding and factorising — exam questions"],
  exponents: ["Laws of indices — practice", "Solving with indices — exam questions"],
  logarithms: ["Laws of logarithms — practice", "Laws of logarithms — further practice"],
};

/** Which topics have a built visualisation. Flip one to "ready" when it lands. */
const VIZ_STATUS = {
  "visual-proof": "ready",
  "ambiguous-case": "coming-soon",
  "3d-trigonometry": "coming-soon",
  bearings: "coming-soon",
  "triangle-area-and-rules": "coming-soon",
  "algebraic-proof": "coming-soon",
  exponents: "coming-soon",
  logarithms: "coming-soon",
};

const KIND = { "3d-trigonometry": "3d" };

async function main() {
  const files = await read("content/library-files.json");
  const sheets = await read("content/sheets.json");
  const briefs = await read("content/briefs.json");
  const byId = Object.fromEntries(sheets.map((s) => [s.id, s]));
  const pages = files.doubt_book.sheet_pages;
  const pageOf = (n) => {
    const page = pages[String(n)];
    if (!page) throw new Error(`build-manifest: sheet ${n} was not located in the PDF`);
    return page;
  };

  // lib/copy.ts is TypeScript; pull the two fields we need without importing it.
  const copy = await readFile(path.join(SITE, "lib", "copy.ts"), "utf8");
  function copyFor(slug) {
    const block = new RegExp(
      `"?${slug}"?:\\s*\\{([\\s\\S]*?)\\n  \\},`,
    ).exec(copy);
    if (!block) throw new Error(`build-manifest: no copy for "${slug}"`);
    const pick = (k) => {
      const m = new RegExp(`${k}:\\s*\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`).exec(block[1]);
      if (!m) throw new Error(`build-manifest: no ${k} for "${slug}"`);
      return m[1];
    };
    return { blurb: pick("blurb"), vizTitle: pick("vizTitle") };
  }

  const topics = ORDER.map(([slug, title, documentId, glyph]) => {
    const ids = SHEETS[slug];
    for (const id of ids) if (!byId[id]) throw new Error(`build-manifest: no sheet ${id}`);
    if (!briefs[slug]) throw new Error(`build-manifest: no brief for ${slug}`);

    const rows = files.topics[slug];
    if (!rows || rows.length !== 2) {
      throw new Error(`build-manifest: ${slug} has ${rows?.length ?? 0} practice sets, expected 2`);
    }
    const { blurb, vizTitle } = copyFor(slug);

    return {
      slug,
      title,
      document: documentId,
      glyph,
      blurb,
      brief: slug,
      practice: rows.map((r, i) => ({
        label: PRACTICE_LABELS[slug][i],
        qp: r.qp.path,
        qp_bytes: r.qp.bytes,
        ms: r.ms.path,
        ms_bytes: r.ms.bytes,
      })),
      sheets: ids.map((id) => ({
        id,
        number: byId[id].sheet,
        strand: byId[id].strand,
        title: byId[id].title,
        page: pageOf(byId[id].sheet),
      })),
      viz: {
        status: VIZ_STATUS[slug],
        title: vizTitle,
        kind: KIND[slug] ?? "2d",
        path: `viz/${slug}/`,
      },
    };
  });

  const manifest = {
    site: { title: "Maths Revision" },
    documents: DOCUMENTS,
    topics,
    library: {
      doubt_book: {
        path: files.doubt_book.path,
        bytes: files.doubt_book.bytes,
        pages: files.doubt_book.pages,
        sheets: sheets.map((s) => ({
          id: s.id,
          number: s.sheet,
          strand: s.strand,
          title: s.title,
          page: pageOf(s.sheet),
        })),
      },
    },
  };

  await writeFile(path.join(SITE, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  const ready = topics.filter((t) => t.viz.status === "ready").length;
  console.log(
    `manifest.json      ${topics.length} topics · ${ready} ready · ` +
      `${topics.reduce((n, t) => n + t.sheets.length, 0)} mapped sheets`,
  );
}

main();
