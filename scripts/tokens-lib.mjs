/**
 * Shared CSS-block parsing used by gen-tokens.mjs (which writes
 * public/tokens.css) and check.mjs (which proves it still matches
 * app/globals.css). Both must read the source the same way, so the reader
 * lives in one place.
 */

/** Strip /* … *\/ comments — they carry no declarations. */
export function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * Return the body of the `n`-th (0-indexed) top-level block whose selector
 * matches `selector` exactly, or null. Brace-counting, so nested at-rules
 * inside the block survive.
 */
export function blockBody(css, selector, n = 0) {
  const src = stripComments(css);
  const re = new RegExp(
    `(^|[}\\n])\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{`,
    "g",
  );
  let m;
  let seen = 0;
  while ((m = re.exec(src))) {
    const start = m.index + m[0].length;
    let depth = 1;
    let i = start;
    while (i < src.length && depth > 0) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
    if (seen === n) return src.slice(start, i - 1);
    seen++;
  }
  return null;
}

/**
 * Parse a block body into an ordered Map of `--token` → value. Values are
 * whitespace-normalised so a reflow in either file is not a difference.
 */
export function customProps(body) {
  const out = new Map();
  if (body == null) return out;
  const re = /(--[A-Za-z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(body))) out.set(m[1], m[2].trim().replace(/\s+/g, " "));
  return out;
}

/** Human-readable diff of two token maps. Empty array = identical. */
export function diffProps(a, b, labelA, labelB) {
  const problems = [];
  for (const [k, v] of a) {
    if (!b.has(k)) problems.push(`${k}: present in ${labelA}, missing from ${labelB}`);
    else if (b.get(k) !== v)
      problems.push(`${k}: ${labelA} "${v}" vs ${labelB} "${b.get(k)}"`);
  }
  for (const k of b.keys()) {
    if (!a.has(k)) problems.push(`${k}: present in ${labelB}, missing from ${labelA}`);
  }
  return problems;
}

/**
 * The extra custom properties tokens.css is allowed to declare on top of
 * globals.css's token block: the font-family variables that next/font sets at
 * runtime in the React app and that the standalone pages must set themselves.
 */
export const FONT_VARS = ["--font-sans", "--font-serif", "--font-mono", "--font-hand"];
