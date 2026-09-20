"use client";

/**
 * ThemeProvider — controls the `dark` class on <html>.
 *
 * Skill §4 dark-mode-pairing: light + dark are first-class siblings, not an
 * after-thought. Resolves order: explicit user choice > system preference.
 *
 * State is held in a context so any descendant can read it; toggle is a tiny
 * setter pinned to localStorage so the choice persists across reloads.
 *
 * To avoid the FOUC (light-on-load → flash to dark), we set the class
 * synchronously in a `<script>` injected from layout.tsx **before** React
 * hydrates. This file owns the React-side state machine that takes over
 * once mounted.
 */

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;        // user's choice (may be "system")
  resolved: "light" | "dark"; // what's currently applied to the DOM
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "tome.theme";

function readStored(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function resolve(t: Theme): "light" | "dark" {
  if (t === "system") {
    return typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return t;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  // Hydrate from storage on mount.
  useEffect(() => {
    const t = readStored();
    setThemeState(t);
    setResolved(resolve(t));
  }, []);

  // Apply class to <html> whenever resolved changes.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  // Watch system preference if theme === "system".
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => setResolved(mql.matches ? "dark" : "light");
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    setResolved(resolve(t));
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, t);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Allow non-providered render paths (e.g. tests) without crashing.
    return {
      theme: "system",
      resolved: "light",
      setTheme: () => {},
    };
  }
  return ctx;
}

/**
 * Inline script that sets the `dark` class **before** React hydrates so the
 * page never flashes light-on-load. Rendered as a string in layout.tsx
 * inside a <script dangerouslySetInnerHTML> tag.
 */
export const themeBootScript = `
  try {
    var t = localStorage.getItem('${STORAGE_KEY}') || 'system';
    var dark = t === 'dark' || (t === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
`;
