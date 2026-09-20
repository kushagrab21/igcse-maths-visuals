#!/usr/bin/env node
/**
 * Build checks. `npm run check` before every `npm run build`.
 *
 * These are site-works checks, not content checks — the study library is
 * verified elsewhere and is not re-examined here.
 *
 *    1. every manifest path resolves to a file under public/
 *    2. the file that reaches out/ at a ready viz path is that standalone page
 *    3. every public/viz/<id>/ (bar _template-*) is in the manifest
 *    4. every standalone page links tokens.css and chrome.js
 *    5. the only external href on the site is the Cambridge past-papers link
 *    6. public/tokens.css still matches the :root / .dark blocks in globals.css
 *    7. every topic has exactly two practice sets, both resolving to files
 *    8. every sheet in the manifest exists in the library's src/ and its page
 *       is inside the published PDF
 *    9. no `IMG_` string survives anywhere — the handwritten material is off
 *       the site, so a stray citation is a leak
 *   10. no raw hex colour in components or app — tokens only, as Tome's
 *       tailwind.config requires
 *
 * Reports every problem it finds, then exits non-zero.
 */
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { blockBody, customProps, diffProps, FONT_VARS } from "./tokens-lib.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PUBLIC = path.join(ROOT, "public");
const OUT = path.join(ROOT, "out");
const LIB = path.join(path.dirname(ROOT), "study_library");

const problems = [];
const notes = [];
const fail = (check, msg) => problems.push(`${check}: ${msg}`);
const ok = (msg) => notes.push(msg);

/** URLs that are identifiers rather than requests. */
const ALLOWED_TEXT = [
  "http://www.w3.org/2000/svg",
  "http://www.w3.org/1999/xhtml",
  "http://www.w3.org/1999/xlink",
];

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

const manifest = JSON.parse(await readFile(path.join(ROOT, "manifest.json"), "utf8"));
const copy = await readFile(path.join(ROOT, "lib", "copy.ts"), "utf8");

/* ── 1. manifest paths resolve ─────────────────────────────────────── */

const underPublic = (p) => path.join(PUBLIC, p.replace(/^\/+/, ""));

for (const topic of manifest.topics) {
  if (topic.viz.status === "ready") {
    const page = path.join(underPublic(topic.viz.path), "index.html");
    if (!existsSync(page)) {
      fail("manifest", `${topic.slug} is ready but ${path.relative(ROOT, page)} is missing`);
    }
  }
}
const book = underPublic(manifest.library.doubt_book.path);
if (!existsSync(book)) fail("manifest", `the Doubt Book is missing at ${path.relative(ROOT, book)}`);
else ok(`the Doubt Book resolves (${manifest.library.doubt_book.pages} pages)`);

/* ── 2. the built page at a ready path is the standalone page ──────── */

if (existsSync(OUT)) {
  for (const topic of manifest.topics) {
    if (topic.viz.status !== "ready") continue;
    const src = path.join(underPublic(topic.viz.path), "index.html");
    const built = path.join(OUT, topic.viz.path, "index.html");
    if (!existsSync(src)) continue;
    if (!existsSync(built)) {
      fail("collision", `${topic.viz.path} was not exported to out/`);
    } else if ((await readFile(src, "utf8")) !== (await readFile(built, "utf8"))) {
      fail(
        "collision",
        `${path.relative(ROOT, built)} is not the standalone page — something else claimed that path`,
      );
    } else {
      ok(`${topic.viz.path} in out/ is byte-identical to its source`);
    }
  }
}

/* ── 3. no orphan visualisation directories ────────────────────────── */

const vizRoot = path.join(PUBLIC, "viz");
const inManifest = new Map(
  manifest.topics.map((t) => [t.viz.path.replace(/\/+$/, ""), t]),
);
for (const e of await readdir(vizRoot, { withFileTypes: true })) {
  if (!e.isDirectory() || e.name.startsWith("_template-")) continue;
  const entry = inManifest.get(`viz/${e.name}`);
  if (!entry) fail("orphan", `public/viz/${e.name}/ is in no manifest topic`);
  else if (entry.viz.status !== "ready") {
    fail("orphan", `public/viz/${e.name}/ exists but ${entry.slug} is "${entry.viz.status}"`);
  } else ok(`public/viz/${e.name}/ ↔ ${entry.slug}`);
}

/* ── 4. standalone pages link the shared files ─────────────────────── */

const standalone = (await walk(vizRoot)).filter((p) => p.endsWith(".html"));
if (!standalone.length) fail("standalone", "no HTML pages under public/viz/");
for (const file of standalone) {
  const rel = path.relative(ROOT, file);
  const html = await readFile(file, "utf8");
  const up = "../".repeat(path.relative(vizRoot, path.dirname(file)).split(path.sep).length + 1);
  const hasCss = html.includes(`href="${up}tokens.css"`);
  const hasJs = html.includes(`src="${up}chrome.js"`);
  if (!hasCss) fail("standalone", `${rel} does not link ${up}tokens.css`);
  if (!hasJs) fail("standalone", `${rel} does not load ${up}chrome.js`);
  if (hasCss && hasJs) ok(`${rel} links tokens.css + chrome.js`);
}

/* ── 5. exactly one external host ──────────────────────────────────── */

const EXTERNAL_ALLOWED = /^https:\/\/www\.cambridgeinternational\.org\//;
const lineOf = (text, i) => text.slice(0, i).split("\n").length;
const external = (url) => !ALLOWED_TEXT.some((a) => url.startsWith(a));

const AUTHORED = ["app", "components", "lib"].map((d) => path.join(ROOT, d)).concat(PUBLIC);
const SHIPPED = [PUBLIC, ...(existsSync(OUT) ? [OUT] : [])];
const VENDOR = [path.join(PUBLIC, "vendor"), path.join(OUT, "vendor")];
const isVendor = (f) => VENDOR.some((v) => f.startsWith(v));
const TEXTY = /\.(html|css|js|mjs|cjs|ts|tsx|json|txt|md)$/i;

let cambridgeSeen = 0;
const bareUrl = /\bhttps?:\/\/[^\s"'`)<>\\]+/gi;
for (const dir of AUTHORED) {
  for (const file of await walk(dir)) {
    if (!TEXTY.test(file) || isVendor(file)) continue;
    const rel = path.relative(ROOT, file);
    if (rel.startsWith("scripts" + path.sep) || rel.endsWith(".md")) continue;
    const text = await readFile(file, "utf8");
    for (const m of text.matchAll(bareUrl)) {
      const url = m[0].replace(/[.,;:]+$/, "");
      if (!external(url)) continue;
      if (EXTERNAL_ALLOWED.test(url)) {
        cambridgeSeen++;
        continue;
      }
      fail("external", `${rel}:${lineOf(text, m.index)} references ${url}`);
    }
  }
}

const ATTR = /\b(?:src|href|action|srcset|poster)\s*=\s*["']([^"']+)["']/gi;
const CSS_URL = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
const CSS_IMPORT = /@import\s+(?:url\(\s*)?["']([^"']+)["']/gi;
for (const dir of SHIPPED) {
  for (const file of await walk(dir)) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== ".html" && ext !== ".css") continue;
    const rel = path.relative(ROOT, file);
    const text = await readFile(file, "utf8");
    for (const re of ext === ".html" ? [ATTR, CSS_URL] : [CSS_URL, CSS_IMPORT]) {
      for (const m of text.matchAll(re)) {
        for (const ref of m[1].split(",").map((s) => s.trim().split(/\s+/)[0])) {
          if (!/^(?:https?:)?\/\//i.test(ref) || !external(ref)) continue;
          if (EXTERNAL_ALLOWED.test(ref)) continue;
          fail("external", `${rel}:${lineOf(text, m.index)} loads ${ref}`);
        }
      }
    }
  }
}

const JS_FETCH =
  /(?:\bfetch\s*\(|\bimport\s*\(|\bimportScripts\s*\(|\bfrom\s+|\.open\s*\(\s*["'][A-Z]+["']\s*,\s*|\.src\s*=\s*|\bnew\s+(?:Worker|EventSource|WebSocket)\s*\()\s*["'`](https?:\/\/[^"'`]+)/gi;
for (const dir of SHIPPED) {
  for (const file of await walk(dir)) {
    if (!/\.(?:js|mjs|cjs)$/i.test(file)) continue;
    const text = await readFile(file, "utf8");
    for (const m of text.matchAll(JS_FETCH)) {
      if (external(m[1]) && !EXTERNAL_ALLOWED.test(m[1])) {
        fail("external", `${path.relative(ROOT, file)}:${lineOf(text, m.index)} requests ${m[1]}`);
      }
    }
  }
}
if (cambridgeSeen === 0) fail("external", "the Cambridge past-papers link is gone from lib/copy.ts");
if (!problems.some((p) => p.startsWith("external"))) {
  ok(`the Cambridge past-papers link is the only external href`);
}

/* ── 6. tokens.css matches globals.css ─────────────────────────────── */

const globals = await readFile(path.join(ROOT, "app", "globals.css"), "utf8");
const tokens = await readFile(path.join(PUBLIC, "tokens.css"), "utf8");
for (const selector of [":root", ".dark"]) {
  const a = customProps(blockBody(globals, selector, 0));
  const b = customProps(blockBody(tokens, selector, 0));
  if (!a.size || !b.size) {
    fail("tokens", `no \`${selector}\` custom properties in ${a.size ? "tokens.css" : "globals.css"}`);
    continue;
  }
  for (const v of FONT_VARS) b.delete(v);
  const d = diffProps(a, b, "globals.css", "tokens.css");
  for (const line of d) fail("tokens", `${selector} — ${line}`);
  if (!d.length) ok(`${selector}: ${a.size} tokens identical in globals.css and tokens.css`);
}

/* ── 7. two practice sets per topic, all resolving ─────────────────── */

for (const topic of manifest.topics) {
  if (topic.practice.length !== 2) {
    fail("practice", `${topic.slug} has ${topic.practice.length} practice sets, expected 2`);
  }
  for (const set of topic.practice) {
    for (const role of ["qp", "ms"]) {
      const file = underPublic(set[role]);
      if (!existsSync(file)) {
        fail("practice", `${topic.slug} → ${set.label}: ${set[role]} is not in public/`);
      }
    }
  }
}
if (!problems.some((p) => p.startsWith("practice"))) {
  ok(`${manifest.topics.length} topics × 2 practice sets, every file present`);
}

/* ── 8. every sheet exists in the library and lands inside the PDF ─── */

const bookPages = manifest.library.doubt_book.pages;
const srcDir = path.join(LIB, "08_revision_sheets", "book", "src");
const haveSrc = existsSync(srcDir);
let sheetCount = 0;
for (const topic of manifest.topics) {
  for (const sheet of topic.sheets) {
    sheetCount++;
    if (haveSrc && !existsSync(path.join(srcDir, `${sheet.id}.md`))) {
      fail("sheets", `${topic.slug} → ${sheet.id} has no src/${sheet.id}.md`);
    }
    if (!(sheet.page >= 1 && sheet.page <= bookPages)) {
      fail("sheets", `${topic.slug} → ${sheet.id} points at page ${sheet.page} of a ${bookPages}-page book`);
    }
  }
}
if (!haveSrc) ok("study_library/…/book/src is not present — sheet ids not cross-checked");
if (!problems.some((p) => p.startsWith("sheets"))) {
  ok(`${sheetCount} topic sheets resolve, every page inside the ${bookPages}-page book`);
}

/* ── 9. no IMG_ anywhere ───────────────────────────────────────────── */

const IMG = /\bIMG_\d+/g;
for (const dir of [...AUTHORED, path.join(ROOT, "content"), ...(existsSync(OUT) ? [OUT] : [])]) {
  for (const file of await walk(dir)) {
    if (!TEXTY.test(file) || isVendor(file)) continue;
    const rel = path.relative(ROOT, file);
    const text = await readFile(file, "utf8");
    const hit = IMG.exec(text);
    IMG.lastIndex = 0;
    if (hit) fail("photos", `${rel}:${lineOf(text, hit.index)} still names ${hit[0]}`);
  }
}
if (!existsSync(path.join(ROOT, "manifest.json"))) fail("photos", "no manifest.json");
else if (IMG.test(await readFile(path.join(ROOT, "manifest.json"), "utf8"))) {
  fail("photos", "manifest.json still names a photo");
}
IMG.lastIndex = 0;
if (!problems.some((p) => p.startsWith("photos"))) {
  ok("no photo reference survives in the site, its content or its build output");
}

/* ── 10. tokens, not raw hex, in the React app ─────────────────────── */

// Two exemptions, both of them Tome's own doing rather than ours:
//   · a line that is defining a shadow — tailwind.config's boxShadow scale is
//     literal rgba in Tome too, and a shadow is not a palette decision;
//   · the `@media print` block in globals.css, which is copied from Tome
//     verbatim and prints ink-on-white with #ccc rules and #444 link URLs.
//     DESIGN_SOURCE.md commits to copying that file rather than re-tuning it,
//     so flagging its contents would be asking to break the contract.
const HEX = /#(?:[0-9a-f]{3}|[0-9a-f]{6})\b/gi;

/** Character range of the top-level `@media print { … }` rule, if any. */
function printRange(css) {
  const i = css.indexOf("@media print");
  if (i < 0) return null;
  let depth = 0;
  for (let j = css.indexOf("{", i); j < css.length; j++) {
    if (css[j] === "{") depth++;
    else if (css[j] === "}" && --depth === 0) return [i, j];
  }
  return [i, css.length];
}

for (const dir of [path.join(ROOT, "app"), path.join(ROOT, "components")]) {
  for (const file of await walk(dir)) {
    if (!/\.(tsx?|css)$/.test(file)) continue;
    const rel = path.relative(ROOT, file);
    const text = await readFile(file, "utf8");
    const print = file.endsWith(".css") ? printRange(text) : null;
    for (const m of text.matchAll(HEX)) {
      if (print && m.index >= print[0] && m.index <= print[1]) continue;
      const line = text.split("\n")[lineOf(text, m.index) - 1];
      if (/shadow|rgba\(/i.test(line)) continue;
      fail("hex", `${rel}:${lineOf(text, m.index)} uses the raw colour ${m[0]} — use a token`);
    }
  }
}
if (!problems.some((p) => p.startsWith("hex"))) {
  ok("no raw hex colour in app/ or components/ outside Tome's verbatim print block");
}

/* ── report ────────────────────────────────────────────────────────── */

console.log(
  `check: ${manifest.topics.length} topics · ` +
    `${existsSync(OUT) ? "with" : "without"} out/\n`,
);
for (const n of notes) console.log(`  ok   ${n}`);
if (problems.length) {
  console.error(`\n${problems.length} problem${problems.length === 1 ? "" : "s"}:\n`);
  for (const p of problems) console.error(`  FAIL ${p}`);
  console.error("");
  process.exit(1);
}
console.log(`\nall checks passed (${notes.length} ok)`);
