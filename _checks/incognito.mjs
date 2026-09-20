/**
 * Open the live site once in a real incognito window with a fresh profile:
 * no cookies, no localStorage, no signed-in session. Confirms a stranger with
 * the link sees the page, with no login wall and no auth redirect.
 */
import puppeteer from "puppeteer-core";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const URL_ = "https://kushagrab21.github.io/igcse-maths-visuals/";
const profile = await mkdtemp(path.join(tmpdir(), "incognito-"));

const b = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  userDataDir: profile,
  args: ["--incognito", "--no-sandbox", "--hide-scrollbars"],
});
const p = (await b.pages())[0] ?? (await b.newPage());
await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

const chain = [];
p.on("response", (r) => {
  if ([301, 302, 303, 307, 308].includes(r.status())) chain.push(`${r.status()} ${r.url()} → ${r.headers().location}`);
});

const res = await p.goto(URL_, { waitUntil: "networkidle0", timeout: 60000 });
await new Promise((r) => setTimeout(r, 800));

const out = await p.evaluate(() => ({
  url: location.href,
  title: document.title,
  h1: document.querySelector("h1")?.textContent,
  topicCards: document.querySelectorAll("section[aria-labelledby^='doc-'] section").length,
  readyLink: document.querySelector("section[aria-labelledby^='doc-'] li a")?.getAttribute("href"),
  loginWords: /\b(sign in|log in|login|password|authenticate|unauthorized)\b/i.test(document.body.innerText),
  comingSoonLinks: [...document.querySelectorAll("section[aria-labelledby^='doc-'] li")].filter(li => li.textContent.includes("coming soon") && li.querySelector("a")).length,
  cookies: document.cookie,
  storage: (() => { try { return localStorage.length; } catch (e) { return "blocked"; } })(),
}));

console.log("status      :", res.status());
console.log("final url   :", out.url);
console.log("title       :", out.title);
console.log("h1          :", out.h1);
console.log("topic cards :", out.topicCards);
console.log("ready link  :", out.readyLink);
console.log("redirects   :", chain.length ? chain.join(" | ") : "none");
console.log("login wall  :", out.loginWords ? "TEXT SUGGESTS LOGIN" : "none");
console.log("soon w/link :", out.comingSoonLinks);
console.log("cookies     :", out.cookies === "" ? "(none)" : out.cookies);
console.log("localStorage:", out.storage, "keys (fresh profile)");

/* follow the one ready link, still incognito */
await p.click("section[aria-labelledby^='doc-'] li a");
await new Promise((r) => setTimeout(r, 2000));
const viz = await p.evaluate(() => ({
  url: location.href, title: document.title,
  cards: document.querySelectorAll(".card").length,
  nav: !!document.querySelector(".site-nav"),
}));
console.log("\nfollowed the ready link:", JSON.stringify(viz));
await p.screenshot({ path: process.argv[2] + "/incognito-visual-proof.png" });
await p.goto(URL_, { waitUntil: "networkidle0" });
await p.screenshot({ path: process.argv[2] + "/incognito-index.png" });
await b.close();
