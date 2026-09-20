# Effects checklist

Every interaction effect on this site is ported from Tome rather than
approximated. Each row names the Tome file it came from, where it lives here,
and what a browser actually computed for it — light and dark, at 1280×900 and
390×844.

Measured with `_checks/effects.mjs` against the built site; the hover and
expanded screenshots it leaves behind are in `_checks/`.

Tome's source root:
`/Users/kushagra/Desktop/Projects/textbook_companion/frontend`

| | effect | Tome source | here | verified |
|---|---|---|---|---|
| a | **Card / row hover** — border `line` → `accent`, shadow `soft` → `card`, title `ink-1` → `accent`, arrow nudges `translate-x-0.5` and turns accent | `app/page.tsx` QUICK_LINKS `<Link>`; `app/library/Spine.tsx` header button | `components/TopicRow.tsx`, `components/TopicBlocks.tsx` | ✅ light `rgb(198,178,122)` → `rgb(138,50,38)`; dark `rgb(130,96,62)` → `rgb(232,122,88)`. Shadow `0 1px 2px/.06 + 0 1px 1px/.04` → `0 1px 3px/.08 + 0 4px 12px/.05`. Title and chevron both land on the accent token. |
| b | **Icon tile flip** — `accent-soft`/`accent` → `accent`/`white` | `app/page.tsx` quick-link icon `div` | `components/TopicRow.tsx` cover tile | ✅ hover gives `background rgb(138,50,38)` / `color rgb(255,255,255)` in light, `rgb(232,122,88)` / white in dark |
| c | **Row entrance** — `whileInView` fade-up, `once`, `margin: -40px`, delay `min(0.06 × index, 0.48)`, `ease [0.22,1,0.36,1]`, `duration 0.38` | `app/library/Spine.tsx` `motion.article` | `components/TopicRow.tsx` | ✅ props copied verbatim; rows fade in down the column and do not replay on scroll back |
| d | **FadeUp and Stagger** — hero and page sections fade up; lists stagger with `staggerItemVariants` | `components/Motion.tsx` | ported unchanged to `components/Motion.tsx`; used by `app/page.tsx`, `app/topic/[slug]/page.tsx`, `app/doubt-book/page.tsx`, `app/reference/page.tsx` | ✅ file is byte-identical to Tome's |
| e | **Buttons** — primary `bg-accent` + `shadow-soft` → `bg-accent-hover` + `shadow-card`, `active:scale-[0.98]`; secondary `bg-surface` + `border-line-strong` → accent border and text; ghost | `components/ui.tsx` | ported unchanged to `components/ui.tsx`; used on the hero, the Doubt Book download and every practice link | ✅ primary hover `rgb(138,50,38)` → `rgb(96,32,22)` light, `rgb(232,122,88)` → `rgb(240,148,116)` dark |
| f | **Pills** — `neutral`, `accent`, `success`, `warn` tones | `components/ui.tsx` `PILL_TONES` | ported unchanged; 2D/3D chips, document names, Doubt Book strands | ✅ |
| g | **Sticky nav + reading progress** — `sticky top-0`, `bg-surface/80`, `backdrop-blur-md`; 2 px accent bar with spring smoothing | `components/NavBar.tsx`, `components/ReadingProgress.tsx` | `components/NavBar.tsx` (links moved to the left, at the owner's request), `components/ReadingProgress.tsx` unchanged | ✅ `position: sticky`, `backdrop-filter: blur(12px)`, `rgba(250,236,162,0.8)` light and `rgba(102,72,44,0.8)` dark; bar `height 2px`, `rgba(138,50,38,0.8)` / `rgba(232,122,88,0.8)` |
| h | **Focus rings and reduced motion** — `2px solid rgb(var(--ring))`, `outline-offset: 2px`; `prefers-reduced-motion` collapses every duration to `0.01ms` | `app/globals.css` | `app/globals.css` verbatim; re-emitted into `public/tokens.css` by `scripts/gen-tokens.mjs` | ✅ `npm run check` diffs both token blocks on every build |
| i | **Ornament rule** — `hr.rule-ornament` with the ❧ glyph in `border-strong` | `app/globals.css` | between sections on `/topic/<slug>`, `/doubt-book` and `/reference` | ✅ renders `content: "❧"` in `rgb(178,138,56)` light |
| j | **Expand in place** — chevron `ChevronRight` → `ChevronDown`, `AnimatePresence` on height + opacity, `duration 0.32`, `ease [0.22,1,0.36,1]`; expanded rows get `hover:bg-surface-2` | `app/library/Spine.tsx` | `components/TopicRow.tsx`, and the `ROW` class in `components/TopicBlocks.tsx` | ✅ `aria-expanded` flips to `true`, body animates to 1466 px, all four blocks present, 18 KaTeX spans and 5 library links inside |
| k | **Theme toggle** — same three-state component, same `tome.theme` key, no flash on load via `themeBootScript` in `<head>` | `components/ThemeProvider.tsx`, `components/ThemeToggle.tsx` | both ported unchanged; `public/chrome.js` reimplements the same cycle and key for the standalone pages | ✅ light → dark → system; the choice carries between the app and a standalone page |
| l | **Standalone visualisation pages** — same nav, same progress bar, same theme toggle; cards take the same `border-accent` + shadow lift; buttons take the primary look. The diagrams' own interactions are untouched | `components/NavBar.tsx`, `components/ui.tsx` | `public/chrome.js` injects the chrome and the card-hover rule; `public/viz/visual-proof/index.html` carries the button styling | ✅ nav renders at 56 px with the page's own sticky bar directly below it; `npm run check` asserts the page in `out/` is byte-identical to its source |

## What is deliberately not Tome's

- **Nav link placement.** Tome puts its links on the right; here they sit
  beside the brand on the left, because the site's owner asked for that. The
  theme toggle stays far right, and every other property of the bar — height,
  blur, surface alpha, hover states, the `sm` collapse to icons — is Tome's.
- **The cover tile.** Tome shows a book jacket in a 3:4 frame. There is no
  jacket here, so the tile is a square holding a drawn glyph per topic
  (`components/TopicGlyph.tsx`). The hover flip in row **b** is Tome's.
- **No backend.** `Spine.tsx` fetches a table of contents when it opens. The
  four blocks here are already in the bundle, so `toggle` only flips state —
  which is why there is no loading or error branch.
