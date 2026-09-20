# Vendored third-party code

Nothing here is fetched at runtime. Every file in `public/vendor/` is
committed to the repository and served from this site's own origin, so a page
still works offline and no request leaves the site.

## three.module.min.js

| | |
|---|---|
| Package | [three](https://www.npmjs.com/package/three) |
| Version | 0.186.0 |
| License | MIT — see `three.LICENSE` |
| Entry bundled | `build/three.module.js` (which imports `build/three.core.js`) |
| Bundled with | `esbuild 0.25.10` |
| Size | 725 kB |
| sha256 | `6bff6b08121fc77918fe8e5d4a323d51f27acc13cf869bb9af51946e275acc2b` |

Only the standalone 3D pages under `public/viz/` use it; the Next app does
not import three at all.

### How this file was produced

```sh
npm pack three@0.186.0
tar xzf three-0.186.0.tgz
npx esbuild@0.25.10 package/build/three.module.js \
  --bundle --format=esm --minify --legal-comments=none \
  --outfile=three.module.min.js
```

npm does not ship a pre-minified ES module for three any more, and
`three.module.js` is split across two files, so it is bundled here into the
single self-contained module a plain `<script type="module">` can import.

### Refreshing it

Re-run the commands above with the new version, copy the result over
`public/vendor/three.module.min.js`, update the version, size and sha256 in
this table, and run `npm run check`.
