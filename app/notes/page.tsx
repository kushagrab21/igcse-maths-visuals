import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import { FadeUp, Stagger } from "../../components/Motion";
import { Card, CardHeader, Pill } from "../../components/ui";
import { NoteTile } from "../../components/NoteTile";
import { noteGroups, notePhotoCount } from "../../lib/notes";
import { manifest } from "../../lib/manifest";

export const metadata: Metadata = {
  title: `The notes — ${manifest.site.title}`,
  description:
    "The handwritten pages every interactive on this site was built from.",
};

export default function NotesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <FadeUp>
        <header className="mb-10">
          <h1 className="font-serif text-3xl font-semibold leading-tight text-ink-1 sm:text-4xl">
            The notes
          </h1>
          <p className="mt-2 max-w-prose text-base text-ink-2">
            Every page on this site was built from these photographs. Tap one to
            open the full-size image.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill tone="accent">
              {notePhotoCount} photos · IMG_0249–IMG_0266
            </Pill>
            <Pill>Two sheets carry two topics, so they appear twice</Pill>
          </div>
        </header>
      </FadeUp>

      {noteGroups.map((doc, i) => (
        <section key={doc.id} aria-labelledby={`notes-${doc.id}`}>
          {i > 0 && <hr className="rule-ornament" />}
          <h2
            id={`notes-${doc.id}`}
            className="mb-4 font-serif text-2xl font-semibold text-ink-1"
          >
            {doc.title}
          </h2>
          <div className="space-y-6">
            {doc.topics.map((topic) => (
              <Card key={topic.slug} className="overflow-hidden">
                <CardHeader
                  title={topic.title}
                  meta={
                    topic.photos.length === 1
                      ? "1 page"
                      : `${topic.photos.length} pages`
                  }
                  action={
                    <span className="flex items-center gap-1 text-2xs text-ink-4">
                      <ExternalLink className="h-3 w-3" strokeWidth={2} aria-hidden />
                      opens the JPEG
                    </span>
                  }
                />
                <Stagger className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {topic.photos.map((photo) => (
                    <NoteTile
                      key={`${topic.slug}-${photo.id}`}
                      photo={photo}
                      topicTitle={topic.title}
                    />
                  ))}
                </Stagger>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
