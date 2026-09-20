/**
 * Top navigation bar — shared across every page.
 *
 * Ported from Tome's components/NavBar.tsx: same sticky header, same 80 %
 * surface with backdrop blur, same link and brand hover states, same
 * icons-only collapse under `sm`.
 *
 * One deliberate difference from Tome: the links sit beside the brand on the
 * left rather than out on the right, which is what the site's owner asked for.
 * The theme toggle stays far right.
 *
 * public/chrome.js injects the same markup, in plain HTML, at the top of the
 * standalone visualisation pages — keep the two in step.
 */

import Link from "next/link";
import { BookOpen, Compass, LayoutGrid, Library } from "lucide-react";

import { ThemeToggle } from "./ThemeToggle";
import { nav, site } from "../lib/copy";

const NAV = [
  { href: "/", label: nav.topics, Icon: LayoutGrid },
  { href: "/doubt-book/", label: nav.doubtBook, Icon: BookOpen },
  { href: "/reference/", label: nav.reference, Icon: Library },
] as const;

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-3 sm:px-6"
      >
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2 text-ink-1 transition hover:text-accent"
          >
            <Compass
              className="h-5 w-5 transition group-hover:rotate-12"
              strokeWidth={1.75}
              aria-hidden
            />
            <span className="font-serif text-lg font-semibold tracking-tight">
              {site.brand}
            </span>
          </Link>
          <span className="mx-1 hidden h-5 w-px bg-line sm:block" aria-hidden />
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
        </div>
        <ThemeToggle />
      </nav>
    </header>
  );
}
