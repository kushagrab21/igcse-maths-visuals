# G10 Maths — Visual Revision

Interactive revision pages built from a Grade-10 student's handwritten class
notes (IMG_0249–IMG_0266), published as a static site.

- **Topic index** — every topic in the quiz scope, whether or not its page
  exists yet, so the shape of the revision is visible from day one.
- **Notes** — the 18 source photographs, grouped by document and topic.
- **Visualisations** — self-contained interactive pages under `public/viz/`.

The look is Tome's, copied rather than re-invented: see
[DESIGN_SOURCE.md](./DESIGN_SOURCE.md).

---

## Add a page in three steps

**1. Drop the HTML in.**

```sh
mkdir -p public/viz/<id>
cp path/to/your-page.html public/viz/<id>/index.html
```

The page must link the two site-wide files, relative, so it works at any base
path and still opens straight off disk:

```html
<meta name="viz-topic" content="Bearings">
<meta name="viz-title" content="Drawing the diagram">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../chrome.js"></script>
```

`chrome.js` must **not** be `defer`red — it sets the theme class on `<html>`
before first paint. It injects the nav, the reading-progress bar and the
beat-pulse on `.verify` strips. Give the page a `--nav-h: 56px` custom property
and sit any sticky bar of its own at `top: var(--nav-h)`.

Start from a template rather than a blank file:
`public/viz/_template-2d/` (SVG, one slider, one card) or
`public/viz/_template-3d/` (Three.js cuboid, orbit and pinch). Neither is in
the manifest, and `check.mjs` skips `_template-*`.

**2. Add or flip the manifest entry** in `manifest.json`:

```json
{
  "id": "bearings", "topic": "bearings",
  "title": "Bearings — drawing the diagram",
  "blurb": "North lines at the point you measure from…",
  "path": "viz/bearings/", "kind": "2d",
  "source_pages": ["IMG_0251"], "status": "ready"
}
```

Seven entries are already there with `"status": "coming-soon"` — for those,
change `coming-soon` to `ready` and nothing else. `topic` must match a topic
slug under `documents`; `kind` is `"2d"` or `"3d"`.

**3. Check, build, push.**

```sh
npm run check && npm run build
git add -A && git commit -m "Add the bearings page" && git push
npm run deploy          # publishes site/out/ to the gh-pages branch
```

`npm run check` must pass before `npm run build` — it is the only thing
standing between a typo and a broken published page.

---

## The base path

One build serves both a project page and a custom domain, from
`NEXT_PUBLIC_BASE_PATH`:

```sh
NEXT_PUBLIC_BASE_PATH=/igcse-maths-visuals npm run build   # github.io/<repo>/
NEXT_PUBLIC_BASE_PATH= npm run build                        # a domain root
```

It feeds `basePath` and `assetPrefix` in `next.config.ts`, and `asset()` in
`lib/manifest.ts` for the hand-written `<a href>`s that point at files under
`public/`. Links *inside* the standalone pages are relative and never need it.

## What the checks check

`npm run check` (`scripts/check.mjs`) exits non-zero on any of:

1. a `path` in `manifest.json` with `"status": "ready"` and no
   `public/<path>index.html`;
2. a file at that path in `out/` that is **not** the standalone page — a
   prerendered `/viz/[slug]` route writes to the same place, and one would
   silently clobber the other;
3. a `public/viz/<id>/` directory (other than `_template-*`) that nothing in the
   manifest points at, or whose entry is still `coming-soon`;
4. a standalone page that does not link `tokens.css` and `chrome.js`;
5. an external host — as a bare URL in authored source, as a `src`/`href`/
   `url()`/`@import` in any shipped HTML or CSS, or as a URL literal handed to
   `fetch`/`import`/`new Worker`/`.src` in any shipped JavaScript;
6. any drift between the `:root` / `.dark` blocks in `public/tokens.css` and
   `app/globals.css`.

## Refreshing the design tokens

`public/tokens.css` is generated, never edited:

```sh
node scripts/gen-tokens.mjs   # app/globals.css → public/tokens.css
npm run check                 # proves the two agree
```

If Tome's own tokens change, re-copy `app/globals.css` and
`tailwind.config.ts` first — the exact steps, and what to strip, are in
[DESIGN_SOURCE.md](./DESIGN_SOURCE.md).

## Fonts and vendored code

Nothing is fetched at runtime.

- `scripts/fetch-fonts.mjs` downloads Inter, Source Serif 4, JetBrains Mono and
  Caveat into `public/fonts/` as variable woff2 and writes the `@font-face`
  blocks `gen-tokens.mjs` inlines into `tokens.css`. Run it only when the
  families change.
- `public/vendor/three.module.min.js` is bundled from the npm package; version,
  licence, sha256 and the exact commands are in
  [public/vendor/VERSIONS.md](./public/vendor/VERSIONS.md).
- The Next app gets the same four families through `next/font/google`, which
  self-hosts them into `_next/static/media/` at build time.

## Deploy

GitHub Pages, from the `gh-pages` branch. The commands actually used:

```sh
# one-off, already done
gh repo create igcse-maths-visuals --public --source=. --remote=origin --push

# every deploy
NEXT_PUBLIC_BASE_PATH=/igcse-maths-visuals npm run check && npm run build
npm run deploy    # scripts/deploy.sh — pushes out/ to the gh-pages branch

# what Pages thinks
gh api repos/{owner}/igcse-maths-visuals/pages --jq '.status, .html_url'
```

`npm run deploy` force-pushes `out/` as a single commit on `gh-pages`; that
branch holds only built output and is never merged back. `out/.nojekyll` stops
Pages from dropping `_next/`.

This repository has no GitHub Actions workflow — the token in use has no
`workflow` scope — so the branch is built and pushed from a machine.

## Layout

```
site/
  app/            layout, index, /notes, /viz/[slug] (coming-soon topics only)
  components/     NavBar, ReadingProgress, Theme*, Motion, ui — ported from Tome
  lib/            manifest.ts (typed loader), notes.ts (photo grouping), cn.ts
  manifest.json   the single source of truth
  public/
    tokens.css    GENERATED from app/globals.css
    chrome.js     nav + progress bar + theme + beat-pulse for standalone pages
    icon.svg      the site icon
    fonts/        self-hosted woff2
    notes/        the 18 photographs + 560 px thumbnails
    vendor/       three.js
    viz/<id>/     standalone pages
    viz/_template-2d/, _template-3d/
  scripts/        check.mjs, gen-tokens.mjs, fetch-fonts.mjs, deploy.sh
```
