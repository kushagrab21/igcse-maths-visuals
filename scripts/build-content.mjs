/**
 * Turns the study library's Markdown into the HTML the site ships.
 *
 * Everything is rendered here, at authoring time, not in the browser: the
 * pages are static, so there is no reason to send a Markdown parser and a
 * maths typesetter to a phone. KaTeX runs in Node and its stylesheet and
 * fonts are copied into public/katex/, so no request leaves the site.
 *
 *   node scripts/build-content.mjs
 *
 * Writes content/*.json (imported by the app) and public/katex/.
 */
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import katex from "katex";
import { marked } from "marked";

const SITE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const LIB = path.join(path.dirname(SITE), "study_library");
const CONTENT = path.join(SITE, "content");

/* ── maths ──────────────────────────────────────────────────────────── */

/**
 * Render $…$ and $$…$$ with KaTeX before Markdown sees them, protecting the
 * output from the Markdown parser. `_` and `*` are common in TeX and would
 * otherwise be read as emphasis.
 */
const held = [];
function hold(html) {
  held.push(html);
  return `%%KTX${held.length - 1}%%`;
}

function renderMath(md) {
  return md
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) =>
      hold(katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false })),
    )
    .replace(/(^|[^\\$])\$([^$\n]+?)\$/g, (_, before, tex) =>
      before + hold(katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false })),
    );
}

function restoreMath(html) {
  return html.replace(/%%KTX(\d+)%%/g, (_, i) => held[Number(i)]);
}

/* ── the library's own conventions ──────────────────────────────────── */

/**
 * The library annotates every claim with the photograph it came from. Those
 * citations are the library's audit trail, not something a student reads, and
 * the site does not carry the photographs at all — so they come out here.
 */
function stripCitations(md) {
  return md
    // The library's audit trail: where a file was transcribed from, and the
    // "Verified against: …" line every one of its documents carries. Both are
    // addressed to whoever maintains the library, not to a student.
    .replace(/^Transcribed verbatim from[\s\S]*?\.\s*$/gm, "")
    .replace(/^\*?\*?Verified against.*$/gim, "")
    .replace(/^section "[^"]*"\.\s*$/gm, "")
    .replace(/\s*\*\(IMG_[^)]*\)\*/g, "")
    .replace(/\s*\(IMG_[^)]*\)/g, "")
    .replace(/\s*—?\s*IMG_\d+[a-z]?(?:,\s*IMG_\d+[a-z]?)*/g, "")
    .replace(/^.*\bIMG_\d+.*$/gm, (line) => (/^[|>-]/.test(line.trim()) ? line.replace(/IMG_\d+[a-z]?/g, "") : ""))
    .replace(/\(from `[^`]*`\)/g, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

async function md2html(md) {
  held.length = 0;
  const html = await marked.parse(renderMath(stripCitations(md)), { gfm: true, breaks: false });
  return restoreMath(html).trim();
}

/* ── topic briefs ───────────────────────────────────────────────────── */

/** The brief's body: its first `### ` heading up to `## Source of this brief`. */
function briefBody(md) {
  const start = md.search(/^### /m);
  const end = md.search(/^## Source of this brief/m);
  if (start < 0) throw new Error("no `### ` heading in brief");
  return md.slice(start, end < 0 ? undefined : end).trim();
}

/* ── the Doubt Book ─────────────────────────────────────────────────── */

/** Front matter of one sheet: its number, strand and title. */
function sheetMeta(md) {
  const m = /^---\n([\s\S]*?)\n---/.exec(md);
  if (!m) return null;
  const fields = Object.fromEntries(
    [...m[1].matchAll(/^(\w+):\s*(.+)$/gm)].map((x) => [x[1], x[2].trim()]),
  );
  return { sheet: Number(fields.sheet), strand: fields.strand, title: fields.title };
}

async function main() {
  await mkdir(CONTENT, { recursive: true });

  /* topic briefs */
  const briefs = {};
  const topicDirs = (await readdir(path.join(LIB, "02_content"), { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
  for (const slug of topicDirs) {
    const file = path.join(LIB, "02_content", slug, "_topic-brief.md");
    if (!existsSync(file)) continue;
    briefs[slug] = await md2html(briefBody(await readFile(file, "utf8")));
  }
  await writeFile(path.join(CONTENT, "briefs.json"), JSON.stringify(briefs, null, 1) + "\n");
  console.log(`briefs.json        ${Object.keys(briefs).length} topics`);

  /* the Doubt Book's 30 sheets */
  const srcDir = path.join(LIB, "08_revision_sheets", "book", "src");
  const sheets = [];
  for (const name of (await readdir(srcDir)).sort()) {
    if (!/^[TPEL]\d+\.md$/.test(name)) continue;
    const meta = sheetMeta(await readFile(path.join(srcDir, name), "utf8"));
    if (meta) sheets.push({ id: path.basename(name, ".md"), ...meta });
  }
  sheets.sort((a, b) => a.sheet - b.sheet);
  await writeFile(path.join(CONTENT, "sheets.json"), JSON.stringify(sheets, null, 1) + "\n");
  console.log(`sheets.json        ${sheets.length} sheets`);

  /* reference material */
  const reference = {};
  for (const [key, file] of [
    ["formulae", "cambridge_0580_extended_formula_list.md"],
    ["command-words", "cambridge_0580_command_words.md"],
  ]) {
    const md = await readFile(path.join(LIB, "06_formulae_and_reference", file), "utf8");
    reference[key] = await md2html(md.replace(/^#\s+.*$/m, "").trim());
  }
  await writeFile(path.join(CONTENT, "reference.json"), JSON.stringify(reference, null, 1) + "\n");
  console.log(`reference.json     ${Object.keys(reference).length} sections`);

  /* self-hosted KaTeX */
  const katexOut = path.join(SITE, "public", "katex");
  await rm(katexOut, { recursive: true, force: true });
  await mkdir(path.join(katexOut, "fonts"), { recursive: true });
  const dist = path.join(SITE, "node_modules", "katex", "dist");
  // Rewrite the font URLs to sit next to the stylesheet, and keep woff2 only —
  // every browser this site targets has supported woff2 for years.
  const css = (await readFile(path.join(dist, "katex.min.css"), "utf8"))
    .replace(/src:[^;]+;/g, (decl) => {
      const woff2 = /url\(fonts\/([^)]+\.woff2)\)/.exec(decl);
      return woff2 ? `src:url(fonts/${woff2[1]}) format("woff2");` : decl;
    });
  await writeFile(path.join(katexOut, "katex.min.css"), css);
  let fonts = 0;
  for (const f of await readdir(path.join(dist, "fonts"))) {
    if (!f.endsWith(".woff2")) continue;
    await cp(path.join(dist, "fonts", f), path.join(katexOut, "fonts", f));
    fonts++;
  }
  console.log(`public/katex/      katex.min.css + ${fonts} woff2`);
}

main();
