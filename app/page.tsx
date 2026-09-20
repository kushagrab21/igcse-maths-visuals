import { ArrowRight } from "lucide-react";

import { FadeUp } from "../components/Motion";
import { Shelf } from "../components/Shelf";
import { ButtonLink } from "../components/ui";
import { home } from "../lib/copy";
import { asset, readyTopics } from "../lib/manifest";

export default function HomePage() {
  // "Start with …" points at the one built diagram; if none is ready the
  // button falls back to the topic column further down the page.
  const first = readyTopics()[0];

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20">
      <FadeUp>
        <section>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-3 shadow-soft">
            {home.pill}
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-ink-1 sm:text-5xl">
            {home.heading}
          </h1>
          <p className="mt-5 max-w-prose text-lg text-ink-2">{home.subtitle}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {first ? (
              <a
                href={asset(first.viz.path)}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-accent px-5 text-base font-medium text-white shadow-soft transition hover:bg-accent-hover hover:shadow-card active:scale-[0.98]"
              >
                {home.primaryCta}
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </a>
            ) : null}
            <ButtonLink href="/doubt-book/" variant="secondary" size="lg">
              {home.secondaryCta}
            </ButtonLink>
          </div>
        </section>
      </FadeUp>

      <Shelf />
    </main>
  );
}
