import type { Metadata } from "next";
import { ArrowLeft, Clock } from "lucide-react";

import { ButtonLink, EmptyState, Pill } from "../../../components/ui";
import { FadeUp } from "../../../components/Motion";
import {
  documentForTopic,
  manifest,
  topicBySlug,
  vizById,
} from "../../../lib/manifest";

/**
 * /viz/<id>/ — the route for a visualisation that has not been built yet.
 *
 * IFRAME vs REDIRECT: neither. The route hands `/viz/<id>/` to the standalone
 * page itself.
 *
 * The standalone pages live at `public/viz/<id>/index.html`, which `next build`
 * copies to `out/viz/<id>/index.html` — exactly where a prerendered
 * `/viz/[slug]` route would write its own HTML. They cannot both own that URL.
 * Wrapping was the weaker claim on it:
 *
 *   • An iframe would stack two navs and two progress bars, because a
 *     standalone page loads chrome.js and renders the full site chrome itself;
 *     and on iOS Safari an iframe grows to its content height rather than the
 *     viewport's, so the page's sticky a/b bar would scroll away and the reader
 *     would need two nested scrollers to reach the bottom.
 *   • A redirect at this URL would point at itself — an infinite reload.
 *
 * So a *ready* visualisation is served by its own file at `/viz/<id>/`, and the
 * index links straight there. This route prerenders only the topics still to be
 * built, which own no file and would otherwise 404. `scripts/check.mjs` asserts
 * that every ready path in the manifest is the standalone page in `out/`, so
 * the collision cannot come back unnoticed.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return manifest.visualisations
    .filter((v) => v.status !== "ready")
    .map((v) => ({ slug: v.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const viz = vizById(slug);
  if (!viz) return {};
  return { title: `${viz.title} — ${manifest.site.title}`, description: viz.blurb };
}

export default async function VizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const viz = vizById(slug);
  // generateStaticParams only ever hands us a coming-soon id.
  if (!viz) return null;

  const topic = topicBySlug(viz.topic);
  const doc = documentForTopic(viz.topic);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <FadeUp>
        <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
          {doc && <Pill>{doc.title}</Pill>}
          {topic && <Pill tone="accent">{topic.title}</Pill>}
          <Pill className="bg-live-soft text-live">
            {viz.kind === "3d" ? "3D" : "2D"}
          </Pill>
        </div>
        <EmptyState
          icon={<Clock className="h-6 w-6" strokeWidth={1.75} />}
          title={viz.title}
          body={
            <>
              {viz.blurb}
              <br />
              <span className="mt-2 inline-block">
                This page hasn&apos;t been built yet. The notes it will come
                from — {viz.source_pages.join(", ")} — are on the Notes page.
              </span>
            </>
          }
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/notes/" variant="primary">
                See the notes
              </ButtonLink>
              <ButtonLink href="/" variant="secondary">
                <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
                All topics
              </ButtonLink>
            </div>
          }
        />
      </FadeUp>
    </main>
  );
}
