"use client";

/**
 * One photograph on /notes — a thumbnail that opens the full-size JPEG.
 *
 * The thumbnails in public/notes/thumbs/ are 560 px wide; the link points at
 * the 1800 px original next to them. Both are plain files under public/, so
 * the hrefs are written by hand with the deployment's base path in front.
 */

import { motion } from "motion/react";

import { staggerItemVariants } from "./Motion";
import { Pill } from "./ui";
import { asset } from "../lib/manifest";
import type { NotePhoto } from "../lib/notes";

export function NoteTile({
  photo,
  topicTitle,
}: {
  photo: NotePhoto;
  topicTitle: string;
}) {
  return (
    <motion.div variants={staggerItemVariants}>
      <a
        href={asset(`notes/${photo.id}.jpg`)}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-lg border border-line bg-surface p-2 shadow-soft transition hover:border-accent hover:shadow-card"
      >
        <div className="overflow-hidden rounded bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(`notes/thumbs/${photo.id}.jpg`)}
            alt={`${topicTitle} — ${photo.caption}`}
            width={560}
            height={420}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full transition duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="px-1 pb-0.5 pt-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-medium text-ink-1">
              {photo.id}
            </span>
            {photo.shared && <Pill>also {photo.shared}</Pill>}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink-3">
            {photo.caption}
          </p>
        </div>
      </a>
    </motion.div>
  );
}
