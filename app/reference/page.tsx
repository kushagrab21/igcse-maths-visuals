import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import referenceHtml from "../../content/reference.json";
import { FadeUp } from "../../components/Motion";
import { reference as copy, site } from "../../lib/copy";

export const metadata: Metadata = {
  title: `${copy.heading} — ${site.title}`,
  description: copy.subtitle,
};

const html = referenceHtml as Record<string, string>;

export default function ReferencePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <FadeUp>
        <header>
          <h1 className="font-serif text-3xl font-semibold leading-tight text-ink-1 sm:text-4xl">
            {copy.heading}
          </h1>
          <p className="mt-2 max-w-prose text-base text-ink-2">{copy.subtitle}</p>
        </header>
      </FadeUp>

      <section className="mt-10" aria-labelledby="formulae">
        <h2 id="formulae" className="font-serif text-2xl font-semibold text-ink-1">
          {copy.formulae.heading}
        </h2>
        <p className="mt-2 max-w-prose text-sm text-ink-3">{copy.formulae.intro}</p>
        <div
          className="reading topic-brief mt-5 max-w-none"
          dangerouslySetInnerHTML={{ __html: html.formulae }}
        />
      </section>

      <hr className="rule-ornament" />

      <section aria-labelledby="command-words">
        <h2 id="command-words" className="font-serif text-2xl font-semibold text-ink-1">
          {copy.commandWords.heading}
        </h2>
        <p className="mt-2 max-w-prose text-sm text-ink-3">{copy.commandWords.intro}</p>
        <div
          className="reading topic-brief mt-5 max-w-none"
          dangerouslySetInnerHTML={{ __html: html["command-words"] }}
        />
      </section>

      <hr className="rule-ornament" />

      {/* The only link on this site that leaves it. */}
      <p className="text-sm text-ink-2">
        {copy.external.line}{" "}
        <a
          href={copy.external.href}
          target="_blank"
          rel="noopener noreferrer"
          className="touch-target inline-flex items-center gap-1 py-2.5 -my-2.5 font-medium text-accent transition hover:text-accent-hover"
        >
          {copy.external.label}
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </a>
      </p>
    </main>
  );
}
