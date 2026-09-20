#!/usr/bin/env node
/**
 * Build checks. `npm run check` before every `npm run build`.
 *
 *   1. every path in manifest.json exists under public/, and the file that
 *      reaches out/ at that path is that same standalone page
 *   2. every public/viz/<id>/ (bar _template-*) is in the manifest
 *   3. every standalone page links tokens.css and chrome.js
 *   4. no source file or built file references an external host
 *   5. public/tokens.css still matches the :root / .dark blocks in
 *      app/globals.css
 *
 * Exits non-zero on the first category that fails, after reporting every
 * problem it found — so one run tells you everything that is wrong.
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { blockBody, customProps, diffProps, FONT_VARS } from "./tokens-lib.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PUBLIC = path.join(ROOT, "public");
const OUT = path.join(ROOT, "out");

const problems = [];
const notes = [];
const fail = (check, msg) => problems.push(`${check}: ${msg}`);
const ok = (msg) => notes.push(msg);

/** Hosts that may appear in source without being a runtime request. */
const ALLOWED_TEXT = [
  "http://www.w3.org/2000/svg", // SVG namespace — an identifier, not a URL
  "http://www.w3.org/1999/xhtml",
  "http://www.w3.org/1999/xlink",
];

/** Walk a directory, yielding absolute file paths. */
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

/* ── 1. manifest paths exist ───────────────────────────────────────── */

const manifest = JSON.parse(await readFile(path.join(ROOT, "manifest.json"), "utf8"));

const topicSlugs = new Set(
  manifest.documents.flatMap((d) => d.topics.map((t) => t.slug)),
);

for (const v of manifest.visualisations) {
  if (!topicSlugs.has(v.topic)) {
    fail("manifest", `"${v.id}" has topic "${v.topic}", which no document lists`);
  }
  if (!["2d", "3d"].includes(v.kind)) {
    fail("manifest", `"${v.id}" has kind "${v.kind}" (expected "2d" or "3d")`);
  }
  if (!["ready", "coming-soon"].includes(v.status)) {
    fail("manifest", `"${v.id}" has status "${v.status}"`);
  }
  if (v.status !== "ready") continue;
  const page = path.join(PUBLIC, v.path, "index.html");
  if (!existsSync(page)) {
    fail("manifest", `"${v.id}" is ready but ${path.relative(ROOT, page)} is missing`);
  } else {
    ok(`manifest path ${v.path} → ${path.relative(ROOT, page)}`);
  }
}

/* ── 1b. the built page at a ready path is the standalone page ─────── */

/*
 * A prerendered /viz/[slug] route writes out/viz/<id>/index.html — the exact
 * path public/viz/<id>/index.html is copied to. If both ever claim a ready id,
 * one silently clobbers the other and the reader gets the wrapper instead of
 * the visualisation. Compare what actually landed in out/.
 */
if (existsSync(OUT)) {
  for (const v of manifest.visualisations) {
    if (v.status !== "ready") continue;
    const src = path.join(PUBLIC, v.path, "index.html");
    const built = path.join(OUT, v.path, "index.html");
    if (!existsSync(src)) continue;
    if (!existsSync(built)) {
      fail("collision", `${v.path} is ready but ${path.relative(ROOT, built)} was not exported`);
      continue;
    }
    const a = await readFile(src, "utf8");
    const b = await readFile(built, "utf8");
    if (a !== b) {
      fail(
        "collision",
        `${path.relative(ROOT, built)} is not the standalone page — something else ` +
          `(most likely a prerendered /viz/[slug] route) claimed that path`,
      );
    } else {
      ok(`${v.path} in out/ is byte-identical to public/${v.path}index.html`);
    }
  }
}

/* ── 2. every public/viz/<id>/ is in the manifest ──────────────────── */

const vizRoot = path.join(PUBLIC, "viz");
const manifestIds = new Map(manifest.visualisations.map((v) => [v.path.replace(/\/+$/, ""), v]));

const vizDirs = (await readdir(vizRoot, { withFileTypes: true }))
  .filter((e) => e.isDirectory() && !e.name.startsWith("_template-"))
  .map((e) => e.name);

for (const dir of vizDirs) {
  const key = `viz/${dir}`;
  const entry = manifestIds.get(key);
  if (!entry) {
    fail("orphan", `public/viz/${dir}/ exists but nothing in the manifest points at it`);
  } else if (entry.status !== "ready") {
    fail(
      "orphan",
      `public/viz/${dir}/ exists but its manifest entry "${entry.id}" is still "${entry.status}"`,
    );
  } else {
    ok(`public/viz/${dir}/ ↔ manifest "${entry.id}"`);
  }
}

/* ── 3. standalone pages link tokens.css and chrome.js ─────────────── */

const standalone = (await walk(vizRoot)).filter((p) => p.endsWith(".html"));
if (standalone.length === 0) fail("standalone", "no HTML pages found under public/viz/");

for (const file of standalone) {
  const rel = path.relative(ROOT, file);
  const html = await readFile(file, "utf8");
  const depth = path.relative(vizRoot, path.dirname(file)).split(path.sep).length + 1;
  const up = "../".repeat(depth);
  if (!html.includes(`href="${up}tokens.css"`)) {
    fail("standalone", `${rel} does not link ${up}tokens.css`);
  }
  if (!html.includes(`src="${up}chrome.js"`)) {
    fail("standalone", `${rel} does not load ${up}chrome.js`);
  }
  if (html.includes(`href="${up}tokens.css"`) && html.includes(`src="${up}chrome.js"`)) {
    ok(`${rel} links tokens.css + chrome.js`);
  }
}

/* ── 4. no external hosts ──────────────────────────────────────────── */

/*
 * "References an external host" is tested three ways, because a URL sitting in
 * a licence header or an error string is not a request:
 *
 *   4a. authored files (app/, components/, lib/, public/ minus vendor) may not
 *       contain an absolute http(s) URL at all — that catches a pasted CDN
 *       link the moment it lands in the tree;
 *   4b. every HTML and CSS file that ships, built output and vendored code
 *       included, may only point src / href / srcset / action / url() /
 *       @import at same-origin targets;
 *   4c. every JavaScript file that ships may not pass an absolute URL literal
 *       to fetch, import, importScripts, XMLHttpRequest.open or a .src.
 *
 * The browser pass in the deployment verification is the backstop: it records
 * every request the live pages actually make.
 */

const VENDOR = path.join(PUBLIC, "vendor");
const OUT_VENDOR = path.join(OUT, "vendor");
const isVendor = (f) => f.startsWith(VENDOR) || f.startsWith(OUT_VENDOR);
const lineOf = (text, index) => text.slice(0, index).split("\n").length;
const external = (url) => !ALLOWED_TEXT.some((a) => url.startsWith(a));

const AUTHORED = [
  path.join(ROOT, "app"),
  path.join(ROOT, "components"),
  path.join(ROOT, "lib"),
  PUBLIC,
];
const SHIPPED = [PUBLIC, ...(existsSync(OUT) ? [OUT] : [])];
const TEXTY = /\.(html|css|js|mjs|cjs|ts|tsx|json|txt|md)$/i;

/* 4a — authored source carries no absolute URL. */
const bareUrl = /\bhttps?:\/\/[^\s"'`)<>\\]+/gi;
for (const dir of AUTHORED) {
  for (const file of await walk(dir)) {
    if (!TEXTY.test(file) || isVendor(file)) continue;
    const rel = path.relative(ROOT, file);
    // scripts/ is authoring-time tooling and *.md is prose about the build.
    if (rel.startsWith("scripts" + path.sep) || rel.endsWith(".md")) continue;
    const text = await readFile(file, "utf8");
    for (const m of text.matchAll(bareUrl)) {
      const url = m[0].replace(/[.,;:]+$/, "");
      if (external(url)) fail("external", `${rel}:${lineOf(text, m.index)} contains ${url}`);
    }
  }
}

/* 4b — HTML and CSS resource references are same-origin. */
const ATTR = /\b(?:src|href|action|srcset|poster|data)\s*=\s*["']([^"']+)["']/gi;
const CSS_URL = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
const CSS_IMPORT = /@import\s+(?:url\(\s*)?["']([^"']+)["']/gi;

for (const dir of SHIPPED) {
  for (const file of await walk(dir)) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== ".html" && ext !== ".css") continue;
    const rel = path.relative(ROOT, file);
    const text = await readFile(file, "utf8");
    const patterns = ext === ".html" ? [ATTR, CSS_URL] : [CSS_URL, CSS_IMPORT];
    for (const re of patterns) {
      for (const m of text.matchAll(re)) {
        for (const ref of m[1].split(",").map((s) => s.trim().split(/\s+/)[0])) {
          if (!/^(?:https?:)?\/\//i.test(ref)) continue;
          if (!external(ref)) continue;
          fail("external", `${rel}:${lineOf(text, m.index)} loads ${ref}`);
        }
      }
    }
  }
}

/* 4c — no JavaScript asks for an absolute URL. */
const JS_FETCH =
  /(?:\bfetch\s*\(|\bimport\s*\(|\bimportScripts\s*\(|\bfrom\s+|\.open\s*\(\s*["'][A-Z]+["']\s*,\s*|\.src\s*=\s*|\bnew\s+(?:Worker|EventSource|WebSocket)\s*\()\s*["'`](https?:\/\/[^"'`]+)/gi;

for (const dir of SHIPPED) {
  for (const file of await walk(dir)) {
    if (!/\.(?:js|mjs|cjs)$/i.test(file)) continue;
    const rel = path.relative(ROOT, file);
    const text = await readFile(file, "utf8");
    for (const m of text.matchAll(JS_FETCH)) {
      if (external(m[1])) fail("external", `${rel}:${lineOf(text, m.index)} requests ${m[1]}`);
    }
  }
}

if (!problems.some((p) => p.startsWith("external"))) {
  ok("no external host is referenced by authored source, shipped HTML/CSS, or shipped JS");
}

/* ── 5. tokens.css matches globals.css ─────────────────────────────── */

const globals = await readFile(path.join(ROOT, "app", "globals.css"), "utf8");
const tokens = await readFile(path.join(PUBLIC, "tokens.css"), "utf8");

for (const selector of [":root", ".dark"]) {
  const a = customProps(blockBody(globals, selector, 0));
  const b = customProps(blockBody(tokens, selector, 0));
  if (a.size === 0) {
    fail("tokens", `no \`${selector}\` block with custom properties in app/globals.css`);
    continue;
  }
  if (b.size === 0) {
    fail("tokens", `no \`${selector}\` block with custom properties in public/tokens.css`);
    continue;
  }
  // tokens.css additionally declares the font variables next/font sets in the
  // React app; everything else must match app/globals.css exactly.
  for (const v of FONT_VARS) b.delete(v);
  const d = diffProps(a, b, "globals.css", "tokens.css");
  for (const line of d) fail("tokens", `${selector} — ${line}`);
  if (d.length === 0) ok(`${selector}: ${a.size} tokens identical in globals.css and tokens.css`);
}

/* ── report ────────────────────────────────────────────────────────── */

const scanned = existsSync(OUT)
  ? "app/, components/, lib/, public/ and out/"
  : "app/, components/, lib/ and public/ (out/ not built yet)";
console.log(`check: scanned ${scanned}\n`);
for (const n of notes) console.log(`  ok   ${n}`);
if (problems.length) {
  console.error(`\n${problems.length} problem${problems.length === 1 ? "" : "s"}:\n`);
  for (const p of problems) console.error(`  FAIL ${p}`);
  console.error("");
  process.exit(1);
}
console.log(`\nall checks passed (${notes.length} ok)`);
