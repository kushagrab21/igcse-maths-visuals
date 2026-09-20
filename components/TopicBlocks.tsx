/**
 * The four blocks behind a topic: Diagram, The moves, Practise, Doubt Book.
 *
 * Shared by the expanded row on the home page and by /topic/<slug>, so a deep
 * link and an expand-in-place show exactly the same thing.
 */

import { ArrowRight, BookOpen, Download, FileText } from "lucide-react";

import { Pill } from "./ui";
import { asset, briefHtml, doubtBook, fileSize, type Topic } from "../lib/manifest";
import { topic as t } from "../lib/copy";

function BlockHeading({ children, meta }: { children: React.ReactNode; meta?: string }) {
  return (
    <header className="mb-2 flex items-baseline gap-2 border-b border-line/60 pb-1.5">
      <h4 className="font-serif text-sm font-semibold text-ink-1">{children}</h4>
      {meta && <span className="text-2xs text-ink-4">· {meta}</span>}
    </header>
  );
}

/** A row inside a block: the shared hover Tome uses on its concept rows. */
const ROW =
  "group/row flex items-center gap-3 rounded-lg px-3 py-2.5 -mx-3 transition hover:bg-surface-2";

function DiagramBlock({ topic }: { topic: Topic }) {
  const ready = topic.viz.status === "ready";
  return (
    <section>
      <BlockHeading>{t.diagram}</BlockHeading>
      {ready ? (
        <a href={asset(topic.viz.path)} className={ROW}>
          <span className="min-w-0 flex-1 text-sm text-ink-1 group-hover/row:text-accent">
            {topic.viz.title}
          </span>
          <Pill className={topic.viz.kind === "3d" ? "bg-live-soft text-live" : undefined}>
            {topic.viz.kind === "3d" ? "3D" : "2D"}
          </Pill>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-ink-4 transition group-hover/row:translate-x-0.5 group-hover/row:text-accent"
            strokeWidth={2}
            aria-hidden
          />
        </a>
      ) : (
        <p className="px-3 py-2.5 -mx-3 text-sm text-ink-3 opacity-60">{t.noDiagram}</p>
      )}
    </section>
  );
}

function MovesBlock({ topic }: { topic: Topic }) {
  return (
    <section>
      <BlockHeading>{t.moves}</BlockHeading>
      <div
        className="reading topic-brief max-w-none text-[0.95rem]"
        dangerouslySetInnerHTML={{ __html: briefHtml(topic) }}
      />
    </section>
  );
}

function PractiseBlock({ topic }: { topic: Topic }) {
  return (
    <section>
      <BlockHeading meta={`${topic.practice.length} sets`}>{t.practise}</BlockHeading>
      <ul className="space-y-0.5">
        {topic.practice.map((set) => (
          <li key={set.qp} className={ROW}>
            <FileText className="h-4 w-4 shrink-0 text-ink-4" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0 flex-1 text-sm text-ink-1">{set.label}</span>
            <span className="flex shrink-0 items-center gap-2">
              <a
                href={asset(set.qp)}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-line-strong bg-surface px-3 text-xs font-medium text-ink-1 transition hover:border-accent hover:text-accent active:scale-[0.98]"
              >
                {t.questions}
                <span className="ml-1.5 text-ink-4">{fileSize(set.qp_bytes)}</span>
              </a>
              <a
                href={asset(set.ms)}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-line-strong bg-surface px-3 text-xs font-medium text-ink-1 transition hover:border-accent hover:text-accent active:scale-[0.98]"
              >
                {t.answers}
                <span className="ml-1.5 text-ink-4">{fileSize(set.ms_bytes)}</span>
              </a>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SheetsBlock({ topic }: { topic: Topic }) {
  const first = topic.sheets[0];
  const href = `${asset(doubtBook.path)}#page=${first.page}`;
  return (
    <section>
      <BlockHeading meta={t.sheetRange(topic.sheets.map((s) => s.id))}>
        {t.doubtBook}
      </BlockHeading>
      <a href={href} className={ROW}>
        <BookOpen className="h-4 w-4 shrink-0 text-ink-4" strokeWidth={1.75} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-ink-1 group-hover/row:text-accent">
            {topic.sheets.map((s) => `${s.number}. ${s.title}`).join(" · ")}
          </span>
        </span>
        <Download
          className="h-4 w-4 shrink-0 text-ink-4 transition group-hover/row:text-accent"
          strokeWidth={1.75}
          aria-hidden
        />
      </a>
    </section>
  );
}

export function TopicBlocks({ topic }: { topic: Topic }) {
  return (
    <div className="space-y-6">
      <DiagramBlock topic={topic} />
      <MovesBlock topic={topic} />
      <PractiseBlock topic={topic} />
      <SheetsBlock topic={topic} />
    </div>
  );
}
