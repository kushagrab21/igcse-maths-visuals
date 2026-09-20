# Evidence

Screenshots from the checks in the folder above, taken against the **live**
site and compressed for the repository. `_checks/out/` holds the full-size
originals and is not committed.

| file | what it shows |
|---|---|
| `side-by-side-1280x800.jpg` | Tome's `/library` beside this site's home, both at 1280×800, light. Same row anatomy: cover tile, serif title, meta line, gold progress rule, chevron. |
| `hover-row-{light,dark}.jpg` | a topic row under the cursor — border `line` → `accent`, shadow lifted, title and chevron accent, icon tile flipped to accent-on-white. |
| `hover-button-{light,dark}.jpg` | the hero's primary button under the cursor — `accent` → `accent-hover`, shadow `soft` → `card`. |
| `expanded-{light,dark}.jpg` | a row opened in place: the four blocks, the brief's KaTeX, the practice links. |
| `home-1280x800-light.jpg`, `home-390x844-dark.jpg` | the shelf at both widths and both themes. |

Reproduce with `_checks/verify.mjs`, `_checks/effects.mjs` and
`_checks/sidebyside.mjs` — see `../README.md`.
