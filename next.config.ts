import type { NextConfig } from "next";

/**
 * Static export. `next build` writes plain files into ./out — no Node server
 * is needed to host them, which is what GitHub Pages wants.
 *
 * The base path comes from NEXT_PUBLIC_BASE_PATH so one source tree builds
 * for both `https://<owner>.github.io/<repo>/` (base "/igcse-maths-visuals")
 * and a custom-domain root (base "").
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const config: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default config;
