/**
 * R5 — reading-progress bar.
 *
 * A thin oxblood line at the very top of the viewport that fills as the
 * user scrolls down the page. Sits above the NavBar. Pure decoration —
 * signals "this is a long thing, you're somewhere in the middle." No
 * pointer interactions; respects prefers-reduced-motion (Framer Motion
 * does that automatically — the bar still updates, just without spring
 * smoothing).
 */

"use client";

import { motion, useScroll, useSpring } from "motion/react";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  // Smoothed for a slightly more pleasant feel than raw scrollY. Spring
  // settings are conservative — we don't want overshoot on a progress bar.
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    mass: 0.3,
  });
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-accent/80"
      style={{ scaleX: smoothed }}
    />
  );
}
