# Maths Revision

A static site for the eight topics in a Grade-10 maths quiz. One column of
topic rows; open one and it gives you the method, questions with answers, the
matching Doubt Book sheets, and a diagram where one has been built.

| | |
|---|---|
| **/** | the eight topics, in the notes' own order |
| **/topic/\<slug\>/** | one topic, deep-linkable — the same four blocks a row shows when it opens |
| **/doubt-book/** | the thirty fifteen-minute sheets, with the PDF and its index |
| **/reference/** | the formula list and the command words |
| **/viz/\<id\>/** | a self-contained interactive page |

Three files explain the rest:

- [DESIGN_SOURCE.md](./DESIGN_SOURCE.md) — every token and component is copied
  from an app called Tome, and where from.
- [EFFECTS_CHECKLIST.md](./EFFECTS_CHECKLIST.md) — each ported interaction
  effect, its Tome source, and the value a browser computed for it.
- [COPY_REWRITE.md](./COPY_REWRITE.md) — every string, as drafted and as
  shipped, with the reason for each change.

---

## Adding a diagram, in three steps

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

**2. Flip the status.** `manifest.json` is generated, so edit the two places
that feed it and regenerate:

```js
// scripts/build-manifest.mjs
const VIZ_STATUS = { ..., bearings: "ready" };   // was "coming-soon"
const KIND       = { ..., bearings: "3d" };      // only if it is 3D
```

```ts
// lib/copy.ts — the title shown on the row, rewritten for a student
bearings: { blurb: "…", vizTitle: "Drawing the bearing" },
```

```sh
node scripts/build-manifest.mjs
```

**3. Check, build, push.**

```sh
npm run check && npm run build
git add -A && git commit -m "Add the bearings diagram" && git push
npm run deploy          # publishes site/out/ to the gh-pages branch
```

`npm run check` must pass before `npm run build` — it is the only thing
standing between a typo and a broken published page.

---

## Adding a practice set, in three steps

**1. Point at the files.** In `scripts/build-library.py`, add the pair to
`PICKS` for that topic — a path stem under `study_library/`, and the two
suffixes that distinguish questions from answers:

```python
PICKS["bearings"] = [
    ("03_practice/bearings/corbettmaths_bearings_practice", "QUESTIONS", "ANSWERS"),
    ("05_past_paper_questions_by_topic/bearings/edexcel-igcse-4MA1/pmt_bearings_H", "QP", "MS"),
]
```

Exactly two rows per topic. Skip the A-level packs under
`05_past_paper_questions_by_topic/*/edexcel-a-level-pure/`.

**2. Name them.** Add the two labels, in the same order, to
`PRACTICE_LABELS` in `scripts/build-manifest.mjs`. These are read by a
fifteen-year-old, so they are prose, not filenames.

**3. Rebuild.**

```sh
python3 scripts/build-library.py    # copies + recompresses into public/library/
node scripts/build-manifest.mjs
npm run check && npm run build
```

`build-library.py` needs PyMuPDF and Pillow. It downsamples the scans to
140 dpi, skips a file it has already published under a different topic, and
refuses to finish if `public/library/` goes past 25 MB.

---

## Updating the Doubt Book, in three steps

**1. Rebuild the PDF** in the library, from its own sources:

```sh
cd ../study_library/08_revision_sheets/book && python3 build_pdf.py
```

**2. Re-import it.** `build-library.py` recompresses the PDF *and* re-reads
which page each `Sheet N` heading falls on, so a reflowed book cannot leave
the site deep-linking to the wrong page:

```sh
cd ../../../site
python3 scripts/build-library.py
node scripts/build-content.mjs      # re-reads every sheet's front matter
```

**3. Re-map and rebuild.** If sheets were added, renumbered or moved between
strands, update `SHEETS` in `scripts/build-manifest.mjs` — it maps sheet ids to
topics — then:

```sh
node scripts/build-manifest.mjs
npm run check && npm run build
```

`npm run check` asserts that every mapped sheet has a source file and that
every page number lands inside the published PDF.

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

1. a manifest path that resolves to nothing under `public/`;
2. a file at a ready visualisation's path in `out/` that is **not** the
   standalone page — a prerendered route would write to the same place and
   silently clobber it;
3. a `public/viz/<id>/` directory (other than `_template-*`) that no topic
   claims, or whose topic is still `coming-soon`;
4. a standalone page that does not link `tokens.css` and `chrome.js`;
5. any external host other than the one Cambridge past-papers link — checked as
   a bare URL in authored source, as a `src`/`href`/`url()`/`@import` in shipped
   HTML or CSS, and as a URL literal handed to `fetch`/`import`/`new Worker`/
   `.src` in shipped JavaScript;
6. any drift between the `:root` / `.dark` blocks in `public/tokens.css` and
   `app/globals.css`;
7. a topic without exactly two practice sets, or a practice file that is not in
   `public/`;
8. a mapped sheet with no source `.md`, or a page number outside the published
   PDF;
9. any surviving `IMG_` reference — the handwritten material is off the site, so
   a stray citation is a leak;
10. a raw hex colour in `app/` or `components/`. Two exemptions, both Tome's own:
    a line defining a shadow, and the `@media print` block in `globals.css`,
    which is copied verbatim and prints ink-on-white.

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
  app/            layout, home, /topic/[slug], /doubt-book, /reference
  components/     NavBar, Footer, ReadingProgress, Theme*, Motion, ui  (Tome)
                  Shelf, TopicRow, TopicBlocks, TopicGlyph             (here)
  lib/            copy.ts (every string), manifest.ts (typed loader), cn.ts
  content/        GENERATED — briefs, sheets, reference, library file index
  manifest.json   GENERATED by scripts/build-manifest.mjs
  public/
    tokens.css    GENERATED from app/globals.css
    chrome.js     nav + progress bar + theme + beat-pulse for standalone pages
    icon.svg      the site icon
    fonts/        self-hosted woff2
    katex/        GENERATED — self-hosted KaTeX stylesheet + woff2
    library/      GENERATED — the practice PDFs and the Doubt Book
    vendor/       three.js
    viz/<id>/     standalone pages
    viz/_template-2d/, _template-3d/
  scripts/
    build-library.py    study_library PDFs → public/library/  (PyMuPDF, Pillow)
    build-content.mjs   study_library Markdown → content/*.json + public/katex/
    build-manifest.mjs  lib/copy.ts + content/ → manifest.json
    gen-tokens.mjs      app/globals.css → public/tokens.css
    fetch-fonts.mjs     the four families → public/fonts/
    check.mjs           the ten build checks
    deploy.sh           out/ → the gh-pages branch
  _checks/        headless-browser checks; see _checks/README.md
```

### Regenerating everything

The four generators run in this order, because each reads the last one's
output. Only `build-library.py` needs Python.

```sh
python3 scripts/build-library.py   # PDFs, and where each sheet falls in them
node scripts/build-content.mjs     # briefs, sheet front matter, reference, KaTeX
node scripts/build-manifest.mjs    # manifest.json
node scripts/gen-tokens.mjs        # public/tokens.css
npm run check && npm run build
```
