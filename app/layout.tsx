import type { Metadata } from "next";
import { Caveat, Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";

import "./globals.css";

import { NavBar } from "../components/NavBar";
import { ReadingProgress } from "../components/ReadingProgress";
import { ThemeProvider, themeBootScript } from "../components/ThemeProvider";
import { BASE_PATH, manifest } from "../lib/manifest";

// next/font downloads and self-hosts these at build time — nothing is fetched
// from a font CDN at runtime. The same four families are also written to
// public/fonts/ by scripts/fetch-fonts.mjs for the standalone pages.
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});
const hand = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: manifest.site.title,
  description: manifest.site.subtitle,
  // Declared explicitly so no browser falls back to requesting /favicon.ico at
  // the origin root, which a base-path deployment does not own.
  icons: { icon: [{ url: `${BASE_PATH}/icon.svg`, type: "image/svg+xml" }] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable} ${hand.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Pre-hydration theme application — kills the light-flash on dark loads. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <ReadingProgress />
          <NavBar />
          <div className="min-h-[calc(100dvh-3.5rem)]">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
