"use client";

/**
 * Motion primitives — preset motion components with spring-physics defaults
 * tuned for our UI. All respect prefers-reduced-motion via globals.css.
 *
 * skill §7 spring-physics, exit-faster-than-enter, motion-consistency.
 */

import { motion, type HTMLMotionProps } from "motion/react";

const SPRING = { type: "spring" as const, stiffness: 380, damping: 28 };
const SPRING_SOFT = { type: "spring" as const, stiffness: 260, damping: 30 };

/** Fade-up entrance for a single block (cards, sections). */
export function FadeUp({
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING_SOFT, delay }}
      {...props}
    />
  );
}

/** List of children with stagger. Use as outer wrapper; children render via StaggerItem. */
export function Stagger({
  step = 0.04,
  children,
  ...props
}: HTMLMotionProps<"div"> & { step?: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: step } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

/** Pop-in for badges / feedback panels — slight scale + fade. */
export function PopIn(props: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={SPRING}
      {...props}
    />
  );
}

/** Slide-from-below for streaming items (agent turn cards). */
export function SlideUp({
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      {...props}
    />
  );
}
