/**
 * Generates public/tokens.css from app/globals.css + public/fonts/fonts.css.
 *
 * public/tokens.css is the plain-CSS half of the design system: the same
 * tokens, the same vellum page, the same headings, focus rings, ornament rule
 * and beat-pulse, in a file a hand-written <link> can pull in. The standalone
 * visualisation pages under public/viz/ use it; the Next app uses
 * app/globals.css. Neither is hand-tuned — this script copies one into the
 * other, and scripts/check.mjs fails the build if they drift.
 *
 *   node scripts/gen-tokens.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { blockBody, stripComments } from "./tokens-lib.mjs";

const ROOT = process.cwd();
const GLOBALS = path.join(ROOT, "app", "globals.css");
const FONTS = path.join(ROOT, "public", "fonts", "fonts.css");
const OUT = path.join(ROOT, "public", "tokens.css");

/** Lift a whole top-level rule (selector + body) out of the source, verbatim. */
function rule(css, selector, n = 0) {
  const body = blockBody(css, selector, n);
  if (body == null) throw new Error(`gen-tokens: no \`${selector}\` rule in globals.css`);
  return `${selector} {${body}}`;
}

/** Lift an @-rule (@media / @keyframes) by name, verbatim, braces balanced. */
function atRule(css, head) {
  const src = stripComments(css);
  const i = src.indexOf(head);
  if (i < 0) throw new Error(`gen-tokens: no \`${head}\` in globals.css`);
  const start = src.indexOf("{", i);
  let depth = 1;
  let j = start + 1;
  while (j < src.length && depth > 0) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}") depth--;
    j++;
  }
  return src.slice(i, j).trim();
}

const HEADER = `/* ════════════════════════════════════════════════════════════════════
   tokens.css — GENERATED. Do not edit by hand.

   Written by \`node scripts/gen-tokens.mjs\` from app/globals.css, which in
   turn holds Tome's tokens verbatim (see DESIGN_SOURCE.md). Edit
   app/globals.css and re-run the generator; \`npm run check\` fails if this
   file and globals.css disagree.

   Loaded by the standalone pages in public/viz/ — the React app gets the
   same tokens through app/globals.css instead.
   ════════════════════════════════════════════════════════════════════ */`;

async function main() {
  const globals = await readFile(GLOBALS, "utf8");
  const fonts = await readFile(FONTS, "utf8");

  // next/font declares these in the React app; standalone pages need them too.
  const fontVars = [
    ":root {",
    "  --font-sans: 'Inter';",
    "  --font-serif: 'Source Serif 4';",
    "  --font-mono: 'JetBrains Mono';",
    "  --font-hand: 'Caveat';",
    "}",
  ].join("\n");

  const parts = [
    HEADER,
    "",
    "/* ── Self-hosted type ───────────────────────────────────────────── */",
    fonts.replace(/url\(\.\//g, "url(./fonts/").trim(),
    "",
    "/* ── Design tokens — light ──────────────────────────────────────── */",
    rule(globals, ":root", 0),
    "",
    "/* ── Design tokens — dark ───────────────────────────────────────── */",
    rule(globals, ".dark", 0),
    "",
    fontVars,
    "",
    "/* ── Vellum page ────────────────────────────────────────────────── */",
    rule(globals, "html", 0),
    "",
    rule(globals, "html.dark", 0),
    "",
    "/* ── Base type ──────────────────────────────────────────────────── */",
    "body {\n  background: transparent;\n  color: rgb(var(--ink-2));\n  font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;\n" +
      '  font-feature-settings: "cv11", "ss01", "ss03";\n' +
      "  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  text-rendering: optimizeLegibility;\n}",
    "",
    rule(globals, "h1, h2, h3, h4", 0),
    "",
    rule(globals, ".tabular", 0),
    "",
    "/* ── Section ornament ───────────────────────────────────────────── */",
    rule(globals, "hr.rule-ornament", 0),
    "",
    rule(globals, "hr.rule-ornament::after", 0),
    "",
    "/* ── Focus rings ────────────────────────────────────────────────── */",
    rule(globals, "*:focus", 0),
    "",
    rule(globals, "*:focus-visible", 0),
    "",
    rule(globals, "input:focus-visible, textarea:focus-visible, select:focus-visible", 0),
    "",
    "/* ── Beat pulse — the ✓ strips reuse this ───────────────────────── */",
    atRule(globals, "@keyframes beat-pulse"),
    "",
    rule(globals, ".beat-just-activated", 0),
    "",
    "/* ── Reduced motion ─────────────────────────────────────────────── */",
    atRule(globals, "@media (prefers-reduced-motion: reduce)"),
    "",
  ];

  const css = parts
    .join("\n")
    .replace(/[ \t]+$/gm, "")      // comment stripping leaves ragged ends
    .replace(/\n{3,}/g, "\n\n");
  await writeFile(OUT, css);
  console.log(`wrote ${path.relative(ROOT, OUT)}`);
}

main();
