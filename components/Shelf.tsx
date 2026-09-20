"use client";

/**
 * The home page's topic column.
 *
 * A single vertical stack, max-w-3xl, in the notes' own order — Tome's shelf.
 * The document a topic belongs to is a meta line inside its row rather than a
 * heading above a group, so the reader sees one list of eight and not two
 * lists of four.
 */

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { TopicRow } from "./TopicRow";
import { documentName, topics, type Topic } from "../lib/manifest";
import { home } from "../lib/copy";

/** The search field only earns its place once the shelf is busy. */
const SEARCH_THRESHOLD = 6;

function matches(topic: Topic, q: string): boolean {
  if (!q) return true;
  const hay = [topic.title, topic.blurb, topic.viz.title, documentName(topic)]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word));
}

export function Shelf() {
  const [query, setQuery] = useState("");
  const ready = topics.filter((t) => t.viz.status === "ready").length;
  const showSearch = ready >= SEARCH_THRESHOLD;
  const q = showSearch ? query.trim() : "";
  const shown = useMemo(() => topics.filter((t) => matches(t, q)), [q]);

  return (
    <section className="mt-16">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-2xs font-medium uppercase tracking-[0.16em] text-ink-4">
          {home.sectionLabel}
        </h2>
        {showSearch && (
          <div className="relative w-full max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={home.searchPlaceholder}
              aria-label={home.searchPlaceholder}
              className="w-full rounded-lg border border-line bg-surface py-1.5 pl-9 pr-3 text-sm text-ink-1 transition-all duration-300 placeholder:text-ink-4 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/60"
            />
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-3">{home.searchEmpty(q)}</p>
      ) : (
        <div className="space-y-3">
          {shown.map((topic, i) => (
            <TopicRow key={topic.slug} topic={topic} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
