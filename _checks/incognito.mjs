/**
 * Open the live site once in a real incognito window on a fresh profile: no
 * cookies, no localStorage, no signed-in session. Confirms a stranger with the
 * link sees the page, with no login wall and no auth redirect, and that the
 * handwritten material really is gone.
 *
 *   node _checks/incognito.mjs <dir> [url]
 */
import puppeteer from "puppeteer-core";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const URL_ = process.argv[3] || "https://kushagrab21.github.io/igcse-maths-visuals/";
const DIR = process.argv[2];
const profile = await mkdtemp(path.join(tmpdir(), "incognito-"));

const b = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  userDataDir: profile,
  args: ["--incognito", "--no-sandbox", "--hide-scrollbars"],
});
const p = (await b.pages())[0] ?? (await b.newPage());
await p.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

const redirects = [];
p.on("response", (r) => {
  if ([301, 302, 303, 307, 308].includes(r.status()))
    redirects.push(`${r.status()} ${r.url()} → ${r.headers().location}`);
});

const res = await p.goto(URL_, { waitUntil: "networkidle0", timeout: 60000 });
await new Promise((r) => setTimeout(r, 900));

const out = await p.evaluate(() => ({
  url: location.href,
  title: document.title,
  h1: document.querySelector("h1")?.textContent,
  rows: document.querySelectorAll("main article").length,
  navLinks: [...document.querySelectorAll("header nav a")].map((a) => a.textContent.trim()),
  footer: document.querySelector("footer")?.textContent.trim(),
  loginWords: /\b(sign in|log in|login|password|authenticate|unauthorized)\b/i.test(document.body.innerText),
  photos: /\bIMG_\d+/.test(document.documentElement.innerHTML),
  images: document.querySelectorAll("img").length,
  cookies: document.cookie,
  storage: (() => { try { return localStorage.length; } catch (e) { return "blocked"; } })(),
}));

console.log("status      :", res.status());
console.log("final url   :", out.url);
console.log("title       :", out.title);
console.log("h1          :", out.h1);
console.log("topic rows  :", out.rows);
console.log("nav         :", out.navLinks.join(" · "));
console.log("footer      :", out.footer);
console.log("redirects   :", redirects.length ? redirects.join(" | ") : "none");
console.log("login wall  :", out.loginWords ? "TEXT SUGGESTS LOGIN" : "none");
console.log("IMG_ on page:", out.photos ? "PRESENT" : "none");
console.log("<img> tags  :", out.images);
console.log("cookies     :", out.cookies === "" ? "(none)" : out.cookies);
console.log("localStorage:", out.storage, "keys (fresh profile)");

/* follow the hero's primary link, still incognito */
await p.click('main a[href*="viz/"]');
await new Promise((r) => setTimeout(r, 2200));
const viz = await p.evaluate(() => ({
  url: location.href,
  cards: document.querySelectorAll(".card").length,
  nav: !!document.querySelector(".site-nav"),
  brand: document.querySelector(".site-brand span")?.textContent,
}));
console.log("\nfollowed the hero link:", JSON.stringify(viz));
await p.screenshot({ path: `${DIR}/incognito-viz.png` });
await p.goto(URL_, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 700));
await p.screenshot({ path: `${DIR}/incognito-home.png` });
await b.close();
