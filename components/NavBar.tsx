/**
 * Top navigation bar — shared across every page.
 *
 * Ported from Tome's components/NavBar.tsx; only the brand, the link list and
 * the right-hand toggles differ. Brand left, nav links centre/right, theme
 * toggle far right. Mobile (<sm): icons only, no labels.
 *
 * public/chrome.js injects the same markup, in plain HTML, at the top of the
 * standalone visualisation pages — keep the two in step.
 */

import Link from "next/link";
import { Compass, Images, LayoutGrid } from "lucide-react";

import { ThemeToggle } from "./ThemeToggle";

// Two destinations, which is the whole site: the topic map, and the photos the
// pages were built from.
const NAV = [
  { href: "/", label: "Topics", Icon: LayoutGrid },
  { href: "/notes/", label: "Notes", Icon: Images },
] as const;

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:px-6"
      >
        <Link
          href="/"
          className="group flex items-center gap-2 text-ink-1 transition hover:text-accent"
        >
          <Compass
            className="h-5 w-5 transition group-hover:rotate-12"
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="font-serif text-lg font-semibold tracking-tight">
            G10 Maths
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <ul className="flex items-center gap-0.5 sm:gap-1">
            {NAV.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-ink-3 transition hover:bg-muted hover:text-ink-1 sm:px-3"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <span className="mx-1 h-5 w-px bg-line" aria-hidden />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
