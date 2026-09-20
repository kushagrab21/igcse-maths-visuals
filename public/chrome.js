/* ════════════════════════════════════════════════════════════════════
   chrome.js — the site's nav bar and reading-progress bar, in plain
   JavaScript, for the standalone pages under public/viz/.

   Those pages are hand-written HTML with their own maths inside; this
   file wraps them in the same chrome the Next app renders, reading the
   same tokens from tokens.css and the same localStorage key as Tome's
   ThemeProvider ("tome.theme"), so the theme a reader picks on the
   index carries into a visualisation and back.

   Load it from <head> WITHOUT `defer` — the theme class has to land on
   <html> before first paint, or a dark-mode reader gets a light flash.
   The DOM it injects waits for DOMContentLoaded.

   What it does:
     1. applies the stored theme to <html> immediately;
     2. injects the nav (Compass + "Maths Revision", "All topics", the
        topic and page title from <meta name="viz-topic" / "viz-title">,
        and the three-state theme toggle);
     3. injects the 2 px accent reading-progress bar;
     4. gives each ✓ verification strip Tome's beat-pulse when its text
        changes, without touching the page's own script.

   Pages keep their own scripts; nothing here reaches into them.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var STORAGE_KEY = "tome.theme"; /* same key as components/ThemeProvider.tsx */
  var NAV_H = 56; /* px — must match --nav-h in the page's own stylesheet */

  /* ── 1. theme, before first paint ──────────────────────────────── */

  function stored() {
    try {
      var t = localStorage.getItem(STORAGE_KEY);
      return t === "light" || t === "dark" || t === "system" ? t : "system";
    } catch (e) {
      return "system";
    }
  }

  function prefersDark() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  function resolve(t) {
    return t === "system" ? (prefersDark() ? "dark" : "light") : t;
  }

  function apply(t) {
    var dark = resolve(t) === "dark";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }

  apply(stored());

  /* ── icons — lucide, 24×24, stroke 1.75, currentColor ──────────── */

  var SVG_NS = "http://www.w3.org/2000/svg";

  function icon(size, children) {
    return (
      '<svg xmlns="' +
      SVG_NS +
      '" width="' +
      size +
      '" height="' +
      size +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
      ' stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"' +
      ' aria-hidden="true" focusable="false">' +
      children +
      "</svg>"
    );
  }

  var ICONS = {
    compass:
      '<circle cx="12" cy="12" r="10"/>' +
      '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/>',
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    sun:
      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/>' +
      '<path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>' +
      '<path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/>' +
      '<path d="m19.07 4.93-1.41 1.41"/>',
    moon:
      '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
    monitor:
      '<rect width="20" height="14" x="2" y="3" rx="2"/>' +
      '<line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  };

  /* ── chrome styles — tokens only, mirroring components/NavBar.tsx ─ */

  var CSS =
    ".site-progress{position:fixed;inset-inline:0;top:0;z-index:50;height:2px;" +
    "transform-origin:left;transform:scaleX(0);background:rgb(var(--accent-1) / .8);" +
    "pointer-events:none}" +
    ".site-nav{position:sticky;top:0;z-index:40;height:" +
    NAV_H +
    "px;border-bottom:1px solid rgb(var(--border) / .8);" +
    "background:rgb(var(--bg-surface) / .8);backdrop-filter:blur(12px);" +
    "-webkit-backdrop-filter:blur(12px)}" +
    ".site-nav-in{margin:0 auto;display:flex;height:" +
    NAV_H +
    "px;max-width:64rem;align-items:center;justify-content:space-between;" +
    "gap:.5rem;padding:0 .75rem;font-family:var(--font-sans),ui-sans-serif,system-ui,sans-serif}" +
    "@media (min-width:640px){.site-nav-in{padding:0 1.5rem}}" +
    ".site-brand{display:flex;align-items:center;gap:.5rem;flex:0 0 auto;" +
    "color:rgb(var(--ink-1));text-decoration:none;transition:color .2s}" +
    ".site-brand:hover{color:rgb(var(--accent-1))}" +
    ".site-brand svg{transition:transform .2s}" +
    ".site-brand:hover svg{transform:rotate(12deg)}" +
    ".site-brand span{font-family:var(--font-serif),Georgia,serif;font-size:1.125rem;" +
    "font-weight:600;letter-spacing:-.01em;white-space:nowrap}" +
    ".site-nav-right{display:flex;align-items:center;gap:.25rem;min-width:0}" +
    ".site-crumb{display:none;min-width:0;flex-direction:column;justify-content:center;" +
    "padding-right:.5rem;line-height:1.15;text-align:right}" +
    "@media (min-width:768px){.site-crumb{display:flex}}" +
    ".site-crumb b{font-size:.75rem;font-weight:500;color:rgb(var(--ink-2));" +
    "overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".site-crumb i{font-style:normal;font-size:.6875rem;color:rgb(var(--ink-4));" +
    "overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".site-link{display:flex;align-items:center;gap:.375rem;border-radius:.625rem;" +
    "padding:.375rem .5rem;font-size:.875rem;color:rgb(var(--ink-3));text-decoration:none;" +
    "white-space:nowrap;transition:background-color .2s,color .2s}" +
    "@media (min-width:640px){.site-link{padding:.375rem .75rem}}" +
    ".site-link:hover{background:rgb(var(--bg-muted));color:rgb(var(--ink-1))}" +
    ".site-sep{margin:0 .25rem;height:1.25rem;width:1px;background:rgb(var(--border));flex:0 0 auto}" +
    ".site-theme{display:flex;height:2.25rem;width:2.25rem;flex:0 0 auto;align-items:center;" +
    "justify-content:center;border:0;border-radius:.625rem;background:transparent;" +
    "color:rgb(var(--ink-3));cursor:pointer;transition:background-color .2s,color .2s}" +
    ".site-theme:hover{background:rgb(var(--bg-muted));color:rgb(var(--ink-1))}" +
    ".site-nav :focus-visible,.site-theme:focus-visible{outline:2px solid rgb(var(--ring));" +
    "outline-offset:2px;border-radius:4px}" +
    /* Cards on a standalone page pick up the shelf's hover: the border turns
       accent and the shadow lifts soft -> card, exactly as components/ui.tsx
       Card does inside the React app. */
    ".card{transition:border-color .2s cubic-bezier(0.16,1,0.3,1)," +
    "box-shadow .2s cubic-bezier(0.16,1,0.3,1)}" +
    ".card:hover{border-color:rgb(var(--accent-1));" +
    "box-shadow:0 1px 3px rgba(32,27,20,.08),0 4px 12px rgba(32,27,20,.05)}";

  /* ── 2 + 3. inject nav and progress bar ────────────────────────── */

  function meta(name, fallback) {
    var el = document.querySelector('meta[name="' + name + '"]');
    var v = el && el.getAttribute("content");
    return v ? v : fallback;
  }

  function build() {
    /* Declare the icon so the browser does not fall back to /favicon.ico at
       the origin root, which a base-path deployment does not own. */
    if (!document.querySelector('link[rel="icon"]')) {
      var favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/svg+xml";
      favicon.href = "../../icon.svg";
      document.head.appendChild(favicon);
    }

    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    var progress = document.createElement("div");
    progress.className = "site-progress";
    progress.setAttribute("aria-hidden", "true");

    var header = document.createElement("header");
    header.className = "site-nav";
    header.innerHTML =
      '<nav class="site-nav-in" aria-label="Primary">' +
      '<a class="site-brand" href="../../">' +
      icon(20, ICONS.compass) +
      "<span>Maths Revision</span>" +
      "</a>" +
      '<div class="site-nav-right">' +
      '<div class="site-crumb"><b></b><i></i></div>' +
      '<a class="site-link" href="../../">' +
      icon(16, ICONS.arrowLeft) +
      "<span>All topics</span></a>" +
      '<span class="site-sep" aria-hidden="true"></span>' +
      '<button class="site-theme" type="button"></button>' +
      "</div></nav>";

    var crumb = header.querySelector(".site-crumb");
    crumb.querySelector("b").textContent = meta("viz-topic", "");
    crumb.querySelector("i").textContent = meta("viz-title", document.title);
    if (!meta("viz-topic", "")) crumb.style.display = "none";

    document.body.insertBefore(header, document.body.firstChild);
    document.body.insertBefore(progress, document.body.firstChild);

    /* theme toggle — light → dark → system, like components/ThemeToggle.tsx */
    var btn = header.querySelector(".site-theme");
    var order = ["light", "dark", "system"];
    var theme = stored();

    function paint() {
      var glyph = theme === "light" ? ICONS.sun : theme === "dark" ? ICONS.moon : ICONS.monitor;
      var label =
        theme === "light"
          ? "Switch to dark mode"
          : theme === "dark"
            ? "Switch to system theme"
            : "Switch to light mode";
      btn.innerHTML = icon(16, glyph);
      btn.setAttribute("aria-label", label);
      btn.title = "Theme: " + theme;
    }

    btn.addEventListener("click", function () {
      theme = order[(order.indexOf(theme) + 1) % order.length];
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {}
      apply(theme);
      paint();
    });
    paint();

    /* follow the system preference while the choice is "system" */
    if (typeof window.matchMedia === "function") {
      try {
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .addEventListener("change", function () {
            if (theme === "system") apply(theme);
          });
      } catch (e) {}
    }

    /* progress bar */
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var doc = document.documentElement;
        var max = doc.scrollHeight - doc.clientHeight;
        var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        progress.style.transform = "scaleX(" + p.toFixed(4) + ")";
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    pulseVerifications();
  }

  /* ── 4. beat-pulse on the ✓ strips ─────────────────────────────── */

  /**
   * Tome pulses a block when it has just been recomputed (.beat-just-activated
   * in globals.css → a 700 ms live-soft wash). The visualisation pages rewrite
   * their .verify strips whenever a or b changes; watching for that from here
   * keeps the page's own script untouched.
   */
  function pulseVerifications() {
    if (typeof MutationObserver !== "function") return;
    var strips = document.querySelectorAll(".verify");
    if (!strips.length) return;

    var observer = new MutationObserver(function (records) {
      var seen = [];
      for (var i = 0; i < records.length; i++) {
        var el = records[i].target;
        while (el && el.nodeType !== 1) el = el.parentNode;
        while (el && !el.classList.contains("verify")) el = el.parentElement;
        if (el && seen.indexOf(el) === -1) seen.push(el);
      }
      for (var j = 0; j < seen.length; j++) pulse(seen[j]);
    });

    /* A single recompute can arrive as several mutations (the strip's text and
       its pass/fail class change separately). Coalesce them, or the wash
       restarts mid-animation and reads as a flicker. */
    function pulse(el) {
      var now = Date.now();
      if (el.__pulsedAt && now - el.__pulsedAt < 200) return;
      el.__pulsedAt = now;
      el.classList.remove("beat-just-activated");
      void el.offsetWidth; /* restart the animation */
      el.classList.add("beat-just-activated");
      window.setTimeout(function () {
        el.classList.remove("beat-just-activated");
      }, 750);
    }

    for (var i = 0; i < strips.length; i++) {
      observer.observe(strips[i], {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
