/** Screenshot a list of paths at a viewport/theme. node shot.mjs <base> <dir> <w>x<h> <theme> [path...] */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
const [base, dir, size, theme, ...paths] = process.argv.slice(2);
const [w, h] = size.split("x").map(Number);
await mkdir(dir, { recursive: true });
const b = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new", args: ["--no-sandbox", "--hide-scrollbars"],
});
for (const p of paths) {
  const page = await b.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  await page.evaluateOnNewDocument((t) => { try { localStorage.setItem("tome.theme", t); } catch (e) {} }, theme);
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await page.goto(base.replace(/\/$/, "") + p, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 900));
  const probe = await page.evaluate(() => {
    const d = document.documentElement;
    return { scrollW: d.scrollWidth, clientW: d.clientWidth, dark: d.classList.contains("dark") };
  });
  const name = (p === "/" ? "home" : p.replace(/^\/|\/$/g, "").replace(/\//g, "-"));
  await page.screenshot({ path: `${dir}/${name}-${size}-${theme}.png` });
  console.log(`${name.padEnd(22)} ${size} ${theme.padEnd(5)} scroll=${probe.scrollW}/${probe.clientW}` +
    (probe.scrollW > probe.clientW + 1 ? "  HSCROLL" : "") + (errs.length ? `  ERRORS: ${errs.join(" | ")}` : ""));
  await page.close();
}
await b.close();
