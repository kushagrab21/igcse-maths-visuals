"use client";

/**
 * The topic map — the whole library on one page.
 *
 * One section per document, one Card per topic, one row per visualisation.
 * Every topic in the manifest gets a card whether or not anything is ready,
 * so the full shape of the quiz is visible from day one and a page appearing
 * later only flips a row from "coming soon" to a link.
 *
 * Layout and hover states follow Tome's /library shelf.
 */

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

import { FadeUp, Stagger, staggerItemVariants } from "./Motion";
import { Card, CardHeader, Pill } from "./ui";
import {
  asset,
  manifest,
  vizForTopic,
  type Topic,
  type Visualisation,
} from "../lib/manifest";

/** The search field only earns its place once the shelf is busy. */
const SEARCH_THRESHOLD = 6;

function matches(v: Visualisation, topic: Topic, q: string): boolean {
  if (!q) return true;
  const hay = `${v.title} ${v.blurb} ${topic.title} ${topic.slug}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word));
}

function KindPill({ kind }: { kind: Visualisation["kind"] }) {
  return kind === "3d" ? (
    <Pill className="bg-live-soft text-live">3D</Pill>
  ) : (
    <Pill>2D</Pill>
  );
}

/**
 * A ready row links to the standalone page under public/ — a plain <a>, since
 * it is a file rather than a Next route, so the base path is added by hand. A
 * coming-soon row links to the /viz/<id>/ route, which explains what is coming.
 */
function VizRow({ viz }: { viz: Visualisation }) {
  const ready = viz.status === "ready";
  const href = ready ? asset(viz.path) : `/viz/${viz.id}/`;
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-ink-1">{viz.title}</span>
          <KindPill kind={viz.kind} />
          {!ready && <Pill>coming soon</Pill>}
        </div>
        <p className="mt-0.5 text-xs text-ink-3">{viz.blurb}</p>
      </div>
      <ArrowRight
        className="mt-0.5 h-4 w-4 shrink-0 text-ink-4 transition group-hover:translate-x-0.5 group-hover:text-accent"
        strokeWidth={2}
        aria-hidden
      />
    </>
  );

  const className =
    "group flex items-start gap-3 px-5 py-3.5 transition hover:bg-muted hover:text-ink-1" +
    (ready ? "" : " opacity-60");

  return (
    <li>
      {ready ? (
        <a href={href} className={className}>
          {inner}
        </a>
      ) : (
        <Link href={href} className={className}>
          {inner}
        </Link>
      )}
    </li>
  );
}

function TopicCard({ topic }: { topic: Topic }) {
  const rows = vizForTopic(topic.slug);
  return (
    <motion.div variants={staggerItemVariants} className="h-full">
      <Card className="flex h-full flex-col overflow-hidden">
        <CardHeader
          title={topic.title}
          meta={rows.length === 1 ? "1 page" : `${rows.length} pages`}
        />
        <ul className="divide-y divide-line/60">
          {rows.map((v) => (
            <VizRow key={v.id} viz={v} />
          ))}
        </ul>
      </Card>
    </motion.div>
  );
}

export function TopicIndex() {
  const [query, setQuery] = useState("");

  const readyCount = useMemo(
    () => manifest.visualisations.filter((v) => v.status === "ready").length,
    [],
  );
  const showSearch = readyCount >= SEARCH_THRESHOLD;
  const q = showSearch ? query.trim() : "";

  // A topic card survives the filter if at least one of its rows matches.
  const documents = useMemo(
    () =>
      manifest.documents
        .map((doc) => ({
          ...doc,
          topics: doc.topics.filter((t) =>
            vizForTopic(t.slug).some((v) => matches(v, t, q)),
          ),
        }))
        .filter((doc) => doc.topics.length > 0),
    [q],
  );

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <FadeUp>
        <header className="mb-10">
          <h1 className="font-serif text-3xl font-semibold leading-tight text-ink-1 sm:text-4xl">
            {manifest.site.title}
          </h1>
          <p className="mt-2 max-w-prose text-base text-ink-2">
            {manifest.site.subtitle}
          </p>
          <div className="mt-4">
            <Pill tone="accent">
              Built from handwritten class notes · IMG_0249–IMG_0266
            </Pill>
          </div>
        </header>
      </FadeUp>

      {showSearch && (
        <div className="relative mb-8">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics and pages…"
            aria-label="Search topics and pages"
            className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink-1 transition-all duration-300 placeholder:text-ink-4 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/60"
          />
        </div>
      )}

      {documents.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-3">
          Nothing matches “{q}”.
        </p>
      ) : (
        documents.map((doc, i) => (
          <section key={doc.id} aria-labelledby={`doc-${doc.id}`}>
            {i > 0 && <hr className="rule-ornament" />}
            <h2
              id={`doc-${doc.id}`}
              className="mb-4 font-serif text-2xl font-semibold text-ink-1"
            >
              {doc.title}
            </h2>
            <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {doc.topics.map((t) => (
                <TopicCard key={t.slug} topic={t} />
              ))}
            </Stagger>
          </section>
        ))
      )}
    </main>
  );
}
