/**
 * Tome's /library next to the new topic index, both at 1280×800, light theme,
 * stitched into one PNG so the resemblance can be seen rather than asserted.
 */
import puppeteer from "puppeteer-core";
import { readFile, writeFile } from "node:fs/promises";

const OUT = process.argv[2];
const b = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--hide-scrollbars", "--no-sandbox"],
});

const shots = {};
for (const [name, url] of [
  ["tome-library", "http://localhost:3000/library"],
  ["new-home", process.argv[3] || "https://kushagrab21.github.io/igcse-maths-visuals/"],
]) {
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem("tome.theme", "light"); } catch (e) {} });
  await p.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise(r => setTimeout(r, 1200));
  shots[name] = `/-1280x800.png`;
  await p.screenshot({ path: shots[name] });
  console.log(name, "->", shots[name]);
  await p.close();
}

/* stitch: a caption strip over each, side by side, in one canvas */
const p = await b.newPage();
await p.setViewport({ width: 2600, height: 860, deviceScaleFactor: 1 });
const b64 = async (f) => (await readFile(f)).toString("base64");
await p.setContent(`<!doctype html><meta charset="utf-8">
<style>
  body{margin:0;background:#1b1b1b;font:13px/1.4 -apple-system,Inter,sans-serif;color:#eee}
  .row{display:flex;gap:20px;padding:20px}
  figure{margin:0}
  figcaption{padding:0 0 8px;font-weight:600;letter-spacing:.02em}
  figcaption span{font-weight:400;color:#aaa}
  img{display:block;width:1280px;border:1px solid #444}
</style>
<div class="row">
  <figure><figcaption>Tome — /library <span>· reference, localhost:3000</span></figcaption>
    <img src="data:image/png;base64,${await b64(shots["tome-library"])}"></figure>
  <figure><figcaption>Maths Revision — home <span>· kushagrab21.github.io/igcse-maths-visuals/</span></figcaption>
    <img src="data:image/png;base64,${await b64(shots["new-home"])}"></figure>
</div>`, { waitUntil: "load" });
await new Promise(r => setTimeout(r, 400));
await p.screenshot({ path: `${OUT}/side-by-side-1280x800.png`, fullPage: true });
console.log("stitched ->", `${OUT}/side-by-side-1280x800.png`);
await b.close();
