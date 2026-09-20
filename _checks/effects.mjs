/**
 * Exercises each ported effect and reports the computed result, so the
 * checklist is measured rather than asserted. Also leaves hover-state
 * screenshots behind.
 */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const BASE = process.argv[2].replace(/\/$/, "");
const DIR = process.argv[3];
await mkdir(DIR, { recursive: true });

const b = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new", args: ["--no-sandbox", "--hide-scrollbars"],
});

for (const theme of ["light", "dark"]) {
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument((t) => { try { localStorage.setItem("tome.theme", t); } catch (e) {} }, theme);
  await p.goto(BASE + "/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1000));

  console.log(`\n──────── ${theme} ────────`);

  // (g) sticky nav + progress bar
  const chrome = await p.evaluate(() => {
    const nav = document.querySelector("header");
    const bar = document.querySelector('div[class*="origin-left"]');
    const cs = getComputedStyle(nav);
    return {
      position: cs.position, backdrop: cs.backdropFilter,
      bg: cs.backgroundColor, height: nav.getBoundingClientRect().height,
      progressH: bar ? getComputedStyle(bar).height : null,
      progressBg: bar ? getComputedStyle(bar).backgroundColor : null,
    };
  });
  console.log("g  nav:", JSON.stringify(chrome));

  const row = "article:first-of-type";

  // (a) row hover — border + shadow + title colour
  const before = await p.evaluate((s) => {
    const a = document.querySelector(s), h = a.querySelector("h3");
    return { border: getComputedStyle(a).borderTopColor, shadow: getComputedStyle(a).boxShadow.slice(0, 44), title: getComputedStyle(h).color };
  }, row);
  await p.hover(row + " button");
  await new Promise((r) => setTimeout(r, 400));
  const after = await p.evaluate((s) => {
    const a = document.querySelector(s), h = a.querySelector("h3"), t = a.querySelector("button > div:first-child");
    return {
      border: getComputedStyle(a).borderTopColor, shadow: getComputedStyle(a).boxShadow.slice(0, 44),
      title: getComputedStyle(h).color, tileBg: getComputedStyle(t).backgroundColor, tileFg: getComputedStyle(t).color,
      chevron: getComputedStyle(a.querySelector("button > div:last-child")).color,
    };
  }, row);
  console.log("a  rest :", JSON.stringify(before));
  console.log("a  hover:", JSON.stringify(after));
  await p.screenshot({ path: `${DIR}/hover-row-${theme}.png`, clip: { x: 400, y: 760, width: 1200, height: 260 } });

  // (e) button hover
  await p.hover('a[href*="viz/visual-proof"]');
  await new Promise((r) => setTimeout(r, 400));
  const btn = await p.evaluate(() => {
    const el = document.querySelector('a[href*="viz/visual-proof"]');
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor, shadow: cs.boxShadow.slice(0, 44) };
  });
  console.log("e  primary button hover:", JSON.stringify(btn));
  await p.screenshot({ path: `${DIR}/hover-button-${theme}.png`, clip: { x: 400, y: 740, width: 1000, height: 160 } });

  // (j) expand in place
  await p.click(row + " button");
  await new Promise((r) => setTimeout(r, 700));
  const expanded = await p.evaluate((s) => {
    const a = document.querySelector(s);
    const body = a.querySelector('[class*="overflow-hidden"][style], div[style*="height"]');
    return {
      ariaExpanded: a.querySelector("button").getAttribute("aria-expanded"),
      blocks: [...a.querySelectorAll("h4")].map((h) => h.textContent),
      bodyHeight: body ? Math.round(body.getBoundingClientRect().height) : null,
      katex: a.querySelectorAll(".katex").length,
      practiceLinks: a.querySelectorAll('a[href*="library/"]').length,
    };
  }, row);
  console.log("j  expanded:", JSON.stringify(expanded));
  await new Promise((r) => setTimeout(r, 300));
  await p.screenshot({ path: `${DIR}/expanded-${theme}.png` });
  await p.close();
}
await b.close();
