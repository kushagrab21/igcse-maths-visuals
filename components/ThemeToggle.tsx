"use client";

import { Moon, Sun, Monitor } from "lucide-react";

import { useTheme } from "./ThemeProvider";

/**
 * Three-state theme toggle — light / dark / system.
 *
 * Skill §1 keyboard-nav + color-not-only: the toggle has an icon + a
 * screen-reader label per state. Cycling button keeps it compact in the
 * NavBar; for the auth surface (later) we'd switch to a proper menu.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const order: Array<typeof theme> = ["light", "dark", "system"];

  function next() {
    const i = order.indexOf(theme);
    setTheme(order[(i + 1) % order.length]);
  }

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const label =
    theme === "light" ? "Switch to dark mode"
    : theme === "dark" ? "Switch to system theme"
    : "Switch to light mode";

  return (
    <button
      onClick={next}
      aria-label={label}
      title={`Theme: ${theme}`}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition hover:bg-muted hover:text-ink-1"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
