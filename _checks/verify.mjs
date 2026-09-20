/**
 * Headless verification pass. Usage:
 *   node verify.mjs <base-url> <screenshot-dir>
 *
 * For each page × viewport × theme: renders, records console errors and every
 * network request, asserts no horizontal scroll, and screenshots.
 */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.argv[2].replace(/\/+$/, "");
const SHOTS = process.argv[3];
await mkdir(SHOTS, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const VIEWPORTS = [
  { name: "390x844", width: 390, height: 844, mobile: true },
  { name: "1280x800", width: 1280, height: 800, mobile: false },
];
const THEMES = ["light", "dark"];
const PAGES = [
  { name: "home", url: "/" },
  { name: "topic-visual-proof", url: "/topic/visual-proof/" },
  { name: "doubt-book", url: "/doubt-book/" },
  { name: "reference", url: "/reference/" },
  { name: "viz-visual-proof", url: "/viz/visual-proof/" },
];

const origin = new URL(BASE).origin;
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--force-device-scale-factor=2", "--no-sandbox"],
});

const results = [];
let failures = 0;

for (const vp of VIEWPORTS) {
  for (const theme of THEMES) {
    for (const p of PAGES) {
      const page = await browser.newPage();
      await page.setViewport({
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
      });
      const errors = [];
      const requests = [];
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
      page.on("requestfailed", (r) =>
        errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`),
      );
      page.on("request", (r) => requests.push(r.url()));
      const notFound = [];
      page.on("response", (r) => {
        if (r.status() >= 400) notFound.push(`${r.status()} ${r.url()}`);
      });

      // Set the theme the way a reader would: the same localStorage key.
      await page.evaluateOnNewDocument((t) => {
        try {
          localStorage.setItem("tome.theme", t);
        } catch (e) {}
      }, theme);

      await page.goto(BASE + p.url, { waitUntil: "networkidle0", timeout: 45000 });
      await new Promise((r) => setTimeout(r, 700));

      const probe = await page.evaluate(() => {
        const d = document.documentElement;
        const chrome = document.querySelector(".site-nav") || document.querySelector("header nav");
        const bar = document.querySelector(".topbar");
        const navBottom = chrome ? chrome.getBoundingClientRect().bottom : null;
        return {
          dark: d.classList.contains("dark"),
          scrollW: d.scrollWidth,
          clientW: d.clientWidth,
          bodyBg: getComputedStyle(document.body).backgroundColor,
          pageBg: getComputedStyle(d).getPropertyValue("--bg-page").trim(),
          nav: !!chrome,
          navBottom,
          barTop: bar ? bar.getBoundingClientRect().top : null,
          progress: !!(
            document.querySelector(".site-progress") ||
            document.querySelector('div[class*="origin-left"]')
          ),
          // home-only structure
          rows: document.querySelectorAll("main article").length,
          ready: [...document.querySelectorAll("main article")].filter((a) =>
            a.textContent.includes("Ready"),
          ).length,
          soon: [...document.querySelectorAll("main article")].filter((a) =>
            a.textContent.includes("Coming soon"),
          ).length,
          footer: !!document.querySelector("footer"),
          photos: /\bIMG_\d+/.test(document.body.innerHTML),
          // diagram colour, for the theme-recolour proof
          regionStroke: (() => {
            const r = document.querySelector(".reg");
            return r ? getComputedStyle(r).stroke : null;
          })(),
          regionFill: (() => {
            const r = document.querySelector(".reg");
            return r ? getComputedStyle(r).fill : null;
          })(),
          tickColor: (() => {
            const t = document.querySelector(".tick");
            return t ? getComputedStyle(t).color : null;
          })(),
        };
      });

      const offsite = requests.filter((u) => {
        if (u.startsWith("data:") || u.startsWith("blob:") || u.startsWith("about:")) return false;
        try {
          return new URL(u).origin !== origin;
        } catch {
          return false;
        }
      });

      const hScroll = probe.scrollW > probe.clientW + 1;
      const bad = [];
      if (notFound.length) bad.push(`http errors: ${notFound.join(", ")}`);
      if (errors.length) bad.push(`console: ${errors.join(" | ")}`);
      if (hScroll) bad.push(`horizontal scroll: scrollW ${probe.scrollW} > clientW ${probe.clientW}`);
      if (offsite.length) bad.push(`offsite requests: ${offsite.join(", ")}`);
      if (probe.dark !== (theme === "dark")) bad.push(`theme not applied (dark=${probe.dark})`);
      if (!probe.nav) bad.push("no nav");
      if (!probe.progress) bad.push("no progress bar");
      if (!probe.footer) bad.push("no footer");
      if (probe.photos) bad.push("a photo reference is rendered on the page");
      if (bad.length) failures++;

      const file = path.join(SHOTS, `${p.name}-${vp.name}-${theme}.png`);
      await page.screenshot({ path: file, fullPage: false });

      results.push({
        page: p.name,
        viewport: vp.name,
        theme,
        ok: bad.length === 0,
        problems: bad,
        probe,
        requests: requests.length,
        shot: file,
      });
      await page.close();
    }
  }
}

await browser.close();

for (const r of results) {
  const tag = r.ok ? "ok  " : "FAIL";
  console.log(`${tag} ${r.page.padEnd(13)} ${r.viewport.padEnd(9)} ${r.theme.padEnd(5)} ` +
    `reqs=${String(r.requests).padStart(3)} scrollW=${r.probe.scrollW}/${r.probe.clientW}` +
    (r.probe.rows ? ` rows=${r.probe.rows} ready=${r.probe.ready} soon=${r.probe.soon}` : "") +
    ` footer=${r.probe.footer ? "y" : "n"}` +
    (r.probe.regionFill ? ` fill=${r.probe.regionFill} stroke=${r.probe.regionStroke} tick=${r.probe.tickColor}` : "") +
    (r.probe.navBottom != null ? ` navB=${r.probe.navBottom} barT=${r.probe.barTop}` : ""));
  for (const p of r.problems) console.log(`       ${p}`);
}
console.log(`\n${results.length - failures}/${results.length} passed`);
process.exit(failures ? 1 : 0);
