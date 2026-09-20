import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { FadeUp } from "../../../components/Motion";
import { TopicBlocks } from "../../../components/TopicBlocks";
import { TopicGlyph } from "../../../components/TopicGlyph";
import { Pill } from "../../../components/ui";
import { documentName, topics, topicBySlug } from "../../../lib/manifest";
import { nav, site } from "../../../lib/copy";

/**
 * /topic/<slug>/ — one topic, deep-linkable.
 *
 * The same four blocks the home page shows when a row is expanded, so a link
 * shared into a chat lands on exactly what the sender was looking at.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = topicBySlug(slug);
  if (!topic) return {};
  return { title: `${topic.title} — ${site.title}`, description: topic.blurb };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = topicBySlug(slug);
  if (!topic) return null;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <FadeUp>
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 text-sm text-ink-3 transition hover:text-accent"
        >
          <ArrowLeft
            className="h-4 w-4 transition group-hover:-translate-x-0.5"
            strokeWidth={2}
            aria-hidden
          />
          {nav.back}
        </Link>

        <header className="mt-6 flex items-start gap-4 sm:gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-line bg-accent-soft p-2.5 text-accent shadow-soft">
            <TopicGlyph name={topic.glyph} />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-3xl font-semibold leading-tight text-ink-1 sm:text-4xl">
              {topic.title}
            </h1>
            <div className="mt-2">
              <Pill>{documentName(topic)}</Pill>
            </div>
          </div>
        </header>
        <p className="mt-4 max-w-prose text-base text-ink-2">{topic.blurb}</p>
      </FadeUp>

      <hr className="rule-ornament" />

      <TopicBlocks topic={topic} />
    </main>
  );
}
