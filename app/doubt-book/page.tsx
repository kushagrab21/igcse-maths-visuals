import type { Metadata } from "next";
import { Download } from "lucide-react";
import Link from "next/link";

import { FadeUp } from "../../components/Motion";
import { Pill } from "../../components/ui";
import { asset, doubtBook, fileSize, topicForSheet } from "../../lib/manifest";
import { doubtBook as copy, site } from "../../lib/copy";

export const metadata: Metadata = {
  title: `${copy.heading} — ${site.title}`,
  description: copy.subtitle,
};

export default function DoubtBookPage() {
  const href = asset(doubtBook.path);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <FadeUp>
        <header>
          <h1 className="font-serif text-3xl font-semibold leading-tight text-ink-1 sm:text-4xl">
            {copy.heading}
          </h1>
          <p className="mt-2 text-base text-ink-2">{copy.subtitle}</p>
        </header>

        <div className="reading mt-6 max-w-none">
          {copy.intro.map((para) => (
            <p key={para.slice(0, 32)}>{para}</p>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href={href}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-accent px-5 text-base font-medium text-white shadow-soft transition hover:bg-accent-hover hover:shadow-card active:scale-[0.98]"
          >
            <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
            {copy.download}
          </a>
          <span className="text-sm text-ink-3">
            PDF · {fileSize(doubtBook.bytes)} · {doubtBook.pages} pages
          </span>
        </div>
      </FadeUp>

      <hr className="rule-ornament" />

      <section>
        <h2 className="mb-4 text-2xs font-medium uppercase tracking-[0.16em] text-ink-4">
          {copy.indexLabel}
        </h2>
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line/80 text-2xs uppercase tracking-[0.12em] text-ink-4">
                <th scope="col" className="w-12 px-4 py-2.5 font-medium">
                  {copy.columns.number}
                </th>
                <th scope="col" className="hidden px-2 py-2.5 font-medium sm:table-cell">
                  {copy.columns.strand}
                </th>
                <th scope="col" className="px-2 py-2.5 font-medium">
                  {copy.columns.title}
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">
                  {copy.columns.topic}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {doubtBook.sheets.map((sheet) => {
                const topic = topicForSheet(sheet.id);
                return (
                  <tr key={sheet.id} className="group transition hover:bg-surface-2">
                    <td className="tabular px-4 py-2.5 align-top text-ink-3">{sheet.number}</td>
                    <td className="hidden px-2 py-2.5 align-top sm:table-cell">
                      <Pill>{sheet.strand}</Pill>
                    </td>
                    <td className="px-2 py-2.5 align-top">
                      <a
                        href={`${href}#page=${sheet.page}`}
                        className="touch-row text-ink-1 transition group-hover:text-accent"
                      >
                        {sheet.title}
                      </a>
                    </td>
                    <td className="px-4 py-2.5 text-right align-top">
                      {topic ? (
                        <Link
                          href={`/topic/${topic.slug}/`}
                          className="touch-row text-xs text-ink-3 transition hover:text-accent"
                        >
                          {topic.title}
                        </Link>
                      ) : (
                        <span className="text-xs text-ink-4">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
