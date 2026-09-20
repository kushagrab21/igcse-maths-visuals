/**
 * The site's one statement of where it came from.
 *
 * The brief puts provenance in exactly one place; this is it.
 */

import { site } from "../lib/copy";

export function Footer() {
  return (
    <footer className="border-t border-line/60">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-ink-4 sm:px-6">
        {site.footer}
      </div>
    </footer>
  );
}
