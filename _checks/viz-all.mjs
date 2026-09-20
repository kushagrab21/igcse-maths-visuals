/**
 * Every visualisation, both themes, phone and laptop: does it render, does it
 * stay inside the viewport, does it throw, does its chrome arrive, and do its
 * diagrams actually draw?
 *
 *   node _checks/viz-all.mjs <base> <dir>
 */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import { readFile } from "node:fs/promises";

const BASE = process.argv[2].replace(/\/$/, "");
const DIR = process.argv[3];
await mkdir(DIR, { recursive: true });

const manifest = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url), "utf8"));
const VIZ = manifest.topics.filter((t) => t.viz.status === "ready");

const b = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--enable-unsafe-swiftshader", "--use-gl=angle"],
});

let failures = 0;
for (const t of VIZ) {
  for (const [w, h, theme] of [[390, 844, "light"], [1280, 900, "dark"]]) {
    const p = await b.newPage();
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: w < 500, hasTouch: w < 500 });
    await p.evaluateOnNewDocument((x) => { try { localStorage.setItem("tome.theme", x); } catch (e) {} }, theme);
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    p.on("requestfailed", (r) => errs.push(`requestfailed ${r.url()}`));
    const offsite = [];
    p.on("request", (r) => {
      const u = r.url();
      if (/^(data|blob|about):/.test(u)) return;
      try { if (new URL(u).origin !== new URL(BASE).origin) offsite.push(u); } catch {}
    });

    await p.goto(`${BASE}/${t.viz.path}`, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1600));

    const probe = await p.evaluate(() => {
      const d = document.documentElement;
      const svgs = [...document.querySelectorAll("svg.diagram, svg")].filter(
        (s) => !s.closest(".site-nav") && s.getBoundingClientRect().width > 80,
      );
      return {
        title: document.title,
        scrollW: d.scrollWidth, clientW: d.clientWidth,
        dark: d.classList.contains("dark"),
        nav: !!document.querySelector(".site-nav"),
        brand: document.querySelector(".site-brand span")?.textContent ?? null,
        progress: !!document.querySelector(".site-progress"),
        cards: document.querySelectorAll(".card").length,
        /* a diagram that drew nothing has no shapes in it */
        svgs: svgs.length,
        drawn: svgs.reduce((n, s) => n + s.querySelectorAll("path,rect,polygon,circle,line,text").length, 0),
        canvas: !!document.querySelector("canvas"),
        noWebgl: d.classList.contains("no-webgl"),
        buttons: document.querySelectorAll("button:not(.site-theme)").length,
        sliders: document.querySelectorAll('input[type="range"]').length,
        /* the ✓ strips must say something */
        verify: [...document.querySelectorAll(".verify")].map((v) => v.textContent.trim().slice(0, 1)).length,
        verifyEmpty: [...document.querySelectorAll(".verify")].filter((v) => !v.textContent.trim()).length,
      };
    });

    const bad = [];
    if (errs.length) bad.push(`console: ${errs.slice(0, 3).join(" | ")}`);
    if (offsite.length) bad.push(`offsite: ${offsite.slice(0, 2).join(", ")}`);
    if (probe.scrollW > probe.clientW + 1) bad.push(`sideways scroll ${probe.scrollW}>${probe.clientW}`);
    if (!probe.nav) bad.push("no nav");
    if (!probe.progress) bad.push("no progress bar");
    if (probe.brand !== "Maths Revision") bad.push(`brand is "${probe.brand}"`);
    if (probe.dark !== (theme === "dark")) bad.push("theme not applied");
    if (!probe.cards) bad.push("no cards");
    if (!probe.canvas && probe.drawn < 20) bad.push(`diagrams look empty (${probe.svgs} svg, ${probe.drawn} shapes)`);
    if (probe.verifyEmpty) bad.push(`${probe.verifyEmpty} empty ✓ strip(s)`);
    if (bad.length) failures++;

    console.log(
      `${bad.length ? "FAIL" : "ok  "} ${t.slug.padEnd(24)} ${String(w).padStart(4)} ${theme.padEnd(5)} ` +
        `cards=${probe.cards} svg=${probe.svgs} shapes=${String(probe.drawn).padStart(4)} ` +
        `btn=${probe.buttons} slid=${probe.sliders} canvas=${probe.canvas ? "y" : "n"} ✓=${probe.verify}`,
    );
    for (const x of bad) console.log(`       ${x}`);
    if (w === 1280) await p.screenshot({ path: `${DIR}/viz-${t.slug}-${theme}.png` });
    await p.close();
  }
}
await b.close();
console.log(`\n${VIZ.length * 2 - failures}/${VIZ.length * 2} passed`);
process.exit(failures ? 1 : 0);
