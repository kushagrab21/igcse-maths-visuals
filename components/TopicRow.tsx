"use client";

/**
 * One topic on the shelf — Tome's Spine, with the backend fetch taken out.
 *
 * Ported from app/library/Spine.tsx: the same motion.article entrance, the
 * same header button, the same chevron, the same AnimatePresence height
 * animation on the body. What differs is that this site has no backend — the
 * four blocks are already in the bundle — so `toggle` only flips state, and
 * the cover is a drawn glyph rather than a book jacket.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

import { TopicBlocks } from "./TopicBlocks";
import { TopicGlyph } from "./TopicGlyph";
import { documentName, type Topic } from "../lib/manifest";
import { topic as t } from "../lib/copy";

export function TopicRow({ topic, index }: { topic: Topic; index: number }) {
  const [open, setOpen] = useState(false);
  const ready = topic.viz.status === "ready";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.38,
        delay: Math.min(0.06 * index, 0.48),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft transition hover:border-accent hover:shadow-card"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`${open ? "Close" : "Open"} ${topic.title}`}
        className="group flex w-full items-stretch gap-4 px-4 py-4 text-left transition hover:bg-surface-2 sm:gap-5 sm:px-5"
      >
        {/* Cover tile — accent on accent-soft, flipping on hover like Tome's
            quick-link icons on the home page. */}
        <div className="flex h-16 w-16 shrink-0 self-center items-center justify-center rounded-md border border-line bg-accent-soft p-2.5 text-accent shadow-soft transition group-hover:border-accent group-hover:bg-accent group-hover:text-white">
          <TopicGlyph name={topic.glyph} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug text-ink-1 transition group-hover:text-accent sm:text-xl">
            {topic.title}
          </h3>
          <p className="text-xs text-ink-3">{topic.blurb}</p>
          <p className="text-2xs text-ink-4">
            {t.meta(documentName(topic), topic.sheets.length, ready)}
          </p>
          {/* Tome's gold progress rule, reused: full when there is a diagram to
              open, empty when there is not yet. */}
          <div className="mt-1 flex items-center gap-3">
            <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-line-strong transition-[width] duration-500"
                style={{ width: ready ? "100%" : "0%" }}
              />
            </div>
            <span className="tabular shrink-0 text-2xs font-medium text-ink-3">
              {ready ? t.ready : t.notReady}
            </span>
          </div>
        </div>

        <div className="flex items-center self-center text-ink-3 transition group-hover:text-accent">
          {open ? (
            <ChevronDown className="h-4 w-4" strokeWidth={2} aria-hidden />
          ) : (
            <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line/70"
          >
            <div className="px-4 py-5 sm:px-6 sm:py-6">
              <TopicBlocks topic={topic} />
              <div className="mt-6 border-t border-line/60 pt-4">
                <Link
                  href={`/topic/${topic.slug}/`}
                  className="group/open inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 transition hover:text-accent"
                >
                  {t.open}
                  <ChevronRight
                    className="h-4 w-4 transition group-hover/open:translate-x-0.5"
                    strokeWidth={2}
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
