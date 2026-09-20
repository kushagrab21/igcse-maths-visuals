# Site checks

Scripts that drive headless Chrome against the built site. They check that the
site *works* — they do not re-examine the study library, which is verified
elsewhere.

Everything here needs one dependency:

```sh
npm --prefix _checks i puppeteer-core@23
```

| script | what it does |
|---|---|
| `verify.mjs <base> <dir>` | every page × viewport × theme: no console error, no HTTP ≥ 400, no horizontal scroll, no off-origin request, theme applied. Exits non-zero on any failure. |
| `effects.mjs <base> <dir>` | measures the ported hover, expand and chrome effects and prints the computed values that `../EFFECTS_CHECKLIST.md` records; leaves hover and expanded screenshots behind. |
| `shot.mjs <base> <dir> <WxH> <theme> <path…>` | screenshots a list of paths and reports horizontal scroll and console errors. |
| `incognito.mjs <dir>` | opens the live site in a real incognito window on a fresh profile: no cookies, no localStorage, no login wall. |
| `sidebyside.mjs <dir> [url]` | stitches Tome's `/library` beside this site's home at 1280×800. |
| `tome-stub.mjs` | serves invented books on `:8765` so Tome's `/library` renders its real shelf for that screenshot. Read-only; touches nothing in the reference project. |

## Typical run

```sh
BASE=https://kushagrab21.github.io/igcse-maths-visuals

node _checks/verify.mjs  "$BASE/" _checks/out
node _checks/effects.mjs "$BASE"  _checks/out
node _checks/incognito.mjs        _checks/out

# the side-by-side needs Tome running locally for its half of the picture
node _checks/tome-stub.mjs &
( cd ../../Projects/textbook_companion/frontend && npm run dev ) &
node _checks/sidebyside.mjs _checks/out "$BASE/"
```

## One caveat

`effects.mjs` reports the beat-pulse on a visualisation's ✓ strip **twice** per
recompute where it happens once. Both records carry the same timestamp and
there is a single `childList` mutation behind them; the probe's own observer
evaluates `classList.contains(…)` after both the class removal and the addition
have landed, so it counts one pulse as two. The strip washes once.
