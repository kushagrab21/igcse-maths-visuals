/**
 * cn — tiny classnames merger.
 *
 * Resolves the common Tailwind-class composition need without pulling in
 * `clsx` for free since `tailwind-merge` is already a dep. We don't merge
 * conflicting Tailwind utilities here (that needs `tailwind-merge`); just
 * concatenate truthy strings cleanly.
 */

import { twMerge } from "tailwind-merge";

type CN = string | number | boolean | null | undefined;

export function cn(...parts: CN[]): string {
  return twMerge(parts.filter(Boolean).join(" "));
}
