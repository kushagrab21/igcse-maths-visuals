#!/usr/bin/env bash
# Publish site/out/ to the gh-pages branch of the `origin` remote.
#
# The branch holds built output only — one commit, force-pushed, never merged
# back into main. GitHub Pages serves it from the branch root.
#
# A Pages *workflow* would be tidier, but the token in use has no `workflow`
# scope and so cannot push .github/workflows/. See README.md → Deploy.
set -euo pipefail

cd "$(dirname "$0")/.."

[ -d out ] || { echo "no out/ — run npm run build first" >&2; exit 1; }
[ -f out/.nojekyll ] || { echo "out/.nojekyll missing — Pages would drop _next/" >&2; exit 1; }

REMOTE="$(git remote get-url origin)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

git --work-tree="$WORK" --git-dir="$WORK/.git" init -q -b gh-pages
cp -R out/. "$WORK"/
cd "$WORK"
git add -A
git -c user.name="$(git -C - config user.name 2>/dev/null || echo deploy)" \
    -c user.email="$(git -C - config user.email 2>/dev/null || echo deploy@local)" \
    commit -qm "Publish $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push -q --force "$REMOTE" gh-pages:gh-pages
echo "pushed $(git rev-parse --short HEAD) to gh-pages"
