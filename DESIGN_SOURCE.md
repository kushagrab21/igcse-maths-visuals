# Where the design comes from

Nothing in this site's visual language was tuned by eye. Every token, every
type step, every shadow and curve is copied from an existing app called
**Tome** and then left alone.

## Source paths

Read-only. This repository never writes to them.

| What | Source file |
|---|---|
| Colour tokens (`:root`, `.dark`), vellum page background, typography defaults, focus rings, reduced-motion block, `hr.rule-ornament`, `beat-pulse` | `/Users/kushagra/Desktop/Projects/textbook_companion/frontend/app/globals.css` |
| Tailwind theme: `colors`, `fontFamily`, `fontSize`, `boxShadow`, `borderRadius`, `transitionTimingFunction`, `transitionDuration`, `maxWidth` | `/Users/kushagra/Desktop/Projects/textbook_companion/frontend/tailwind.config.ts` |
| `NavBar`, `ReadingProgress`, `ThemeProvider`, `ThemeToggle`, `Motion` (FadeUp / Stagger / staggerItemVariants / PopIn), `ui` (Button, Card, CardHeader, Pill, EmptyState), `lib/cn` | `…/frontend/components/`, `…/frontend/lib/cn.ts` |
| Library-shelf layout, row hover, search-input styling | `…/frontend/app/library/page.tsx`, `…/frontend/app/library/[id]/ConceptRow.tsx`, `…/frontend/app/lesson/ChallengeCard.tsx` |
| Fonts: Inter, Source Serif 4, JetBrains Mono, Caveat via `next/font` | `…/frontend/app/layout.tsx` |

## What was copied verbatim

- **`tailwind.config.ts`** — byte-for-byte, minus one line: the
  `"./widgets/**/*.{ts,tsx}"` content glob, since this site has no `widgets/`.
  `diff` against Tome shows that single deletion and nothing else.
- **`app/globals.css`** — byte-for-byte, minus two sections the brief asked to
  drop: the Sonner toast block and the tutor-notebook surface
  (`.ink-caret`, `.notebook-*`, `.tutor-past`). Everything else, including the
  full `:root` / `.dark` token blocks, the vellum `html` background, `beat-pulse`
  and the print stylesheet, is unchanged.
- **`components/ThemeProvider.tsx`, `ThemeToggle.tsx`, `ReadingProgress.tsx`,
  `Motion.tsx`, `ui.tsx`, `lib/cn.ts`** — copied unmodified. The theme's
  `localStorage` key is still `tome.theme`, so `public/chrome.js` on the
  standalone pages shares it.

## What was changed, and why

- **`components/NavBar.tsx`** — same structure, hover states and spacing; the
  brand reads "G10 Maths", the links are Topics and Notes, and
  `ReaderWidthToggle` / `AudioMuteToggle` are gone (this site has no reader
  column and no audio), as the brief specified.
- **`public/tokens.css`** — not hand-written. `scripts/gen-tokens.mjs` reads
  `app/globals.css` and re-emits the token blocks, the vellum page, the heading
  rules, the ornament, the focus rings, `beat-pulse` and the reduced-motion
  block as plain CSS, with `@font-face` for the four self-hosted families in
  front. `scripts/check.mjs` parses both files and fails the build if a single
  token differs.

## Refreshing the tokens if Tome's change

```sh
cp /Users/kushagra/Desktop/Projects/textbook_companion/frontend/tailwind.config.ts site/
# then re-remove the ./widgets/**/*.{ts,tsx} content glob

# globals.css: copy, then drop the Sonner and tutor-notebook sections
sed '256,352d' \
  /Users/kushagra/Desktop/Projects/textbook_companion/frontend/app/globals.css \
  > site/app/globals.css     # check the line numbers still bound those sections

cd site
node scripts/gen-tokens.mjs   # re-emits public/tokens.css from globals.css
npm run check                 # proves the two agree
npm run build
```

The line range in that `sed` is the one thing that can rot: it currently spans
the `/* Sonner toasts */` comment through the end of `.tutor-past`. Open the
file and confirm the boundaries before trusting it — `npm run check` will not
catch a wrong range, only a token mismatch.
