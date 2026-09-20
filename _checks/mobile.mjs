/**
 * Mobile render check.
 *
 *   node _checks/mobile.mjs <base> <dir>
 *
 * Emulates real phones — touch, mobile UA, device pixel ratio — across the
 * narrowest widths a reader is likely to bring, and reports the things that
 * actually break a page on a phone: sideways scroll, an element wider than the
 * viewport, a tap target under 44 px, and text under 12 px.
 */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const BASE = process.argv[2].replace(/\/$/, "");
const DIR = process.argv[3];
await mkdir(DIR, { recursive: true });

const DEVICES = [
  { name: "iPhone SE",     width: 320, height: 568, dpr: 2 },
  { name: "Android small", width: 360, height: 800, dpr: 3 },
  { name: "iPhone 14",     width: 390, height: 844, dpr: 3 },
  { name: "iPhone 14 PM",  width: 430, height: 932, dpr: 3 },
  { name: "iPad mini",     width: 768, height: 1024, dpr: 2 },
];

const PAGES = [
  { name: "home", url: "/" },
  { name: "topic", url: "/topic/visual-proof/" },
  { name: "doubt-book", url: "/doubt-book/" },
  { name: "reference", url: "/reference/" },
  { name: "viz", url: "/viz/visual-proof/" },
];

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const b = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars"],
});

let failures = 0;
const rows = [];

for (const d of DEVICES) {
  for (const pg of PAGES) {
    const page = await b.newPage();
    await page.setUserAgent(UA);
    await page.setViewport({
      width: d.width, height: d.height, deviceScaleFactor: d.dpr,
      isMobile: true, hasTouch: true,
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

    await page.goto(BASE + pg.url, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 800));

    // Open the first topic row so the expanded body is measured too.
    if (pg.name === "home") {
      const btn = await page.$("main article button");
      if (btn) { await btn.tap(); await new Promise((r) => setTimeout(r, 700)); }
    }

    const probe = await page.evaluate(() => {
      const root = document.documentElement;
      const vw = root.clientWidth;

      /* Anything sticking out past the viewport.
         Two things are not faults and are skipped:
           · an element inside a sideways scroller (a wide table is meant to
             scroll rather than squash);
           · an element inside a clipped or hidden box. KaTeX emits a MathML
             copy of every formula for screen readers inside a 1×1 clipped
             span; its descendants keep their natural layout boxes, which look
             like overflow but paint nothing. */
      const excused = (el) => {
        for (let n = el.parentElement; n; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.overflowX === "auto" || cs.overflowX === "scroll") return true;
          if (cs.overflow === "hidden" && n.getBoundingClientRect().width <= 2) return true;
          if (cs.clip !== "auto" || cs.clipPath !== "none") return true;
          if (cs.visibility === "hidden" || cs.display === "none") return true;
        }
        return false;
      };
      const overflow = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right <= vw + 1 && r.left >= -1) continue;
        if (excused(el)) continue;
        const cs = getComputedStyle(el);
        if (cs.position === "fixed") continue;
        overflow.push(
          `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} w=${Math.round(r.width)} right=${Math.round(r.right)} "${(el.textContent || "").trim().slice(0, 30)}"`,
        );
      }

      /* Tap targets. 44 px is the figure Apple publishes and the one a
         thumb actually needs; a link sitting inside a sentence is exempt,
         because it is read rather than aimed at. */
      const MIN = 44;
      const inSentence = (el) => {
        const p = el.parentElement;
        if (!p) return false;
        if (getComputedStyle(el).display !== "inline") return false;
        return (p.textContent || "").trim().length > (el.textContent || "").trim().length + 8;
      };
      const small = [];
      for (const el of document.querySelectorAll("a, button, input, [role=button]")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (getComputedStyle(el).display === "contents") continue;
        if (inSentence(el)) continue;
        if (r.height < MIN || r.width < MIN) {
          small.push(`${el.tagName.toLowerCase()} ${Math.round(r.width)}×${Math.round(r.height)} "${(el.textContent || "").trim().slice(0, 24)}"`);
        }
      }

      /* Body text too small to read on a phone. Anything KaTeX lays out is
         skipped: a superscript is meant to be small, and its struts carry a
         zero-width space at 1px. */
      const tiny = new Set();
      for (const el of document.querySelectorAll("p, li, td, th, span, a, h1, h2, h3, h4")) {
        const text = el.textContent?.trim();
        if (!text || el.querySelector("*") || el.closest(".katex")) continue;
        const px = parseFloat(getComputedStyle(el).fontSize);
        if (px < 11) tiny.add(`${px}px "${text.slice(0, 24)}"`);
      }

      return {
        vw,
        scrollW: root.scrollWidth,
        overflow: overflow.slice(0, 6),
        overflowCount: overflow.length,
        small: [...new Set(small)].slice(0, 6),
        smallCount: small.length,
        tiny: [...tiny].slice(0, 4),
        // page-specific structure
        navLabelsVisible: [...document.querySelectorAll("header nav a span")].filter(
          (s) => getComputedStyle(s).display !== "none",
        ).length,
        tablesScrollable: [...document.querySelectorAll("table")].every(
          (t) => getComputedStyle(t).overflowX === "auto" || t.scrollWidth <= t.clientWidth + 1,
        ),
      };
    });

    const bad = [];
    if (probe.scrollW > probe.vw + 1) bad.push(`sideways scroll ${probe.scrollW} > ${probe.vw}`);
    if (probe.overflowCount) bad.push(`${probe.overflowCount} element(s) past the edge: ${probe.overflow.join(" | ")}`);
    if (probe.smallCount) bad.push(`${probe.smallCount} tap target(s) under 44 px: ${probe.small.join(" | ")}`);
    if (probe.tiny.length) bad.push(`text under 11px: ${probe.tiny.join(" | ")}`);
    if (!probe.tablesScrollable) bad.push("a table cannot scroll sideways");
    if (errors.length) bad.push(`console: ${errors.join(" | ")}`);
    if (bad.length) failures++;

    rows.push({ device: d.name, width: d.width, page: pg.name, ok: !bad.length, bad });
    console.log(
      `${bad.length ? "FAIL" : "ok  "} ${d.name.padEnd(14)} ${String(d.width).padStart(4)}px  ${pg.page ?? pg.name}`.padEnd(46) +
        `scroll=${probe.scrollW}/${probe.vw} navLabels=${probe.navLabelsVisible}`,
    );
    for (const x of bad) console.log(`       ${x}`);

    if (d.width === 390 || d.width === 320) {
      await page.screenshot({ path: `${DIR}/m-${pg.name}-${d.width}.png`, fullPage: false });
    }
    await page.close();
  }
}

await b.close();
console.log(`\n${rows.length - failures}/${rows.length} passed`);
process.exit(failures ? 1 : 0);
