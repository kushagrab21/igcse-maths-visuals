import type { Config } from "tailwindcss";

/**
 * Tailwind theme rooted in semantic CSS variables (globals.css).
 * Skill §6 — color-semantic: no raw hex inside components.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        page: "rgb(var(--bg-page) / <alpha-value>)",
        surface: "rgb(var(--bg-surface) / <alpha-value>)",
        "surface-2": "rgb(var(--bg-surface-2) / <alpha-value>)",
        muted: "rgb(var(--bg-muted) / <alpha-value>)",
        // Text
        ink: {
          DEFAULT: "rgb(var(--ink-1) / <alpha-value>)",
          1: "rgb(var(--ink-1) / <alpha-value>)",
          2: "rgb(var(--ink-2) / <alpha-value>)",
          3: "rgb(var(--ink-3) / <alpha-value>)",
          4: "rgb(var(--ink-4) / <alpha-value>)",
        },
        // Border
        line: "rgb(var(--border) / <alpha-value>)",
        "line-strong": "rgb(var(--border-strong) / <alpha-value>)",
        // Accent — oxblood, for in-text emphasis + key citations
        accent: {
          DEFAULT: "rgb(var(--accent-1) / <alpha-value>)",
          hover: "rgb(var(--accent-2) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
          ring: "rgb(var(--accent-ring) / <alpha-value>)",
        },
        // Live — verdigris, for interactive surfaces (sliders, checkpoint
        // panels, "now you try" affordances). The reader READS in oxblood;
        // the reader ACTS in verdigris.
        live: {
          DEFAULT: "rgb(var(--live-1) / <alpha-value>)",
          hover: "rgb(var(--live-2) / <alpha-value>)",
          soft: "rgb(var(--live-soft) / <alpha-value>)",
        },
        // Semantic
        success: {
          DEFAULT: "rgb(var(--success) / <alpha-value>)",
          soft: "rgb(var(--success-soft) / <alpha-value>)",
        },
        warn: {
          DEFAULT: "rgb(var(--warn) / <alpha-value>)",
          soft: "rgb(var(--warn-soft) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)",
          soft: "rgb(var(--danger-soft) / <alpha-value>)",
        },
        // Categorical chart palette — for series rotation in DataViz,
        // ParametricPlot, etc. Use chart-1..chart-8 in that order; the
        // first 3 are the same accent / live / warn tokens for designs
        // that lean on 1-3 series.
        chart: {
          1: "rgb(var(--chart-1) / <alpha-value>)",
          2: "rgb(var(--chart-2) / <alpha-value>)",
          3: "rgb(var(--chart-3) / <alpha-value>)",
          4: "rgb(var(--chart-4) / <alpha-value>)",
          5: "rgb(var(--chart-5) / <alpha-value>)",
          6: "rgb(var(--chart-6) / <alpha-value>)",
          7: "rgb(var(--chart-7) / <alpha-value>)",
          8: "rgb(var(--chart-8) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "Times New Roman", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        hand: ["var(--font-hand)", "Caveat", "Bradley Hand", "cursive"],
      },
      // Refined scale aligned with 4/8pt rhythm; reserves room for fine
      // typography (font-size: 13/15 used for ui meta).
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],   // 11px
        xs: ["0.75rem", { lineHeight: "1.125rem" }],    // 12/18
        sm: ["0.875rem", { lineHeight: "1.375rem" }],   // 14/22
        base: ["1rem", { lineHeight: "1.625rem" }],     // 16/26 — generous body
        lg: ["1.125rem", { lineHeight: "1.75rem" }],    // 18/28
        xl: ["1.25rem", { lineHeight: "1.875rem" }],    // 20
        "2xl": ["1.5rem", { lineHeight: "2rem" }],      // 24
        "3xl": ["1.875rem", { lineHeight: "2.375rem" }],// 30
        "4xl": ["2.25rem", { lineHeight: "2.75rem" }],  // 36
        "5xl": ["3rem", { lineHeight: "3.25rem" }],     // 48
      },
      boxShadow: {
        // Soft, scholarly elevation scale — shadows tint warm-ink, not
        // cool-slate, so they belong to the amber palette. Opacities lift
        // ~25% over R1 to hold visible elevation against amber surfaces.
        soft: "0 1px 2px rgba(32, 27, 20, 0.06), 0 1px 1px rgba(32, 27, 20, 0.04)",
        card: "0 1px 3px rgba(32, 27, 20, 0.08), 0 4px 12px rgba(32, 27, 20, 0.05)",
        pop: "0 8px 24px rgba(32, 27, 20, 0.14), 0 2px 6px rgba(32, 27, 20, 0.07)",
      },
      borderRadius: {
        DEFAULT: "0.375rem",  // 6px
        lg: "0.625rem",       // 10px
        xl: "0.875rem",       // 14px — cards
        "2xl": "1.25rem",     // 20px — hero panels
      },
      transitionTimingFunction: {
        // Skill §7 spring-physics — softer curves for natural feel
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
        in: "cubic-bezier(0.7, 0, 0.84, 0)",
        "in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      transitionDuration: {
        // Skill §7 duration-timing — 150–300ms
        DEFAULT: "200ms",
      },
      maxWidth: {
        prose: "65ch",
      },
    },
  },
  plugins: [],
};

export default config;
