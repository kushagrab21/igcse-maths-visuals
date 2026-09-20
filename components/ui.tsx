/**
 * Tome UI primitives — Button, Card, Pill, EmptyState.
 *
 * All consume design tokens (no raw hex). All include the focus-visible
 * ring rule from globals.css. Hover/active states defined in one place.
 */

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "../lib/cn";

/* ── Button ─────────────────────────────────────────────────────────── */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium " +
  "transition active:scale-[0.98] disabled:cursor-not-allowed " +
  "disabled:opacity-50 disabled:hover:bg-inherit";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover " +
    "shadow-soft hover:shadow-card",
  secondary:
    "bg-surface text-ink-1 border border-line-strong " +
    "hover:border-accent hover:text-accent",
  ghost: "text-ink-2 hover:bg-muted hover:text-ink-1",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
      {...rest}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...rest
}: Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

/* ── Card ───────────────────────────────────────────────────────────── */

export function Card({
  className,
  ...rest
}: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-xl border border-line bg-surface shadow-soft",
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({
  title,
  meta,
  action,
}: {
  title: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-baseline justify-between gap-3 border-b border-line/80 px-5 py-3.5">
      <div>
        <h2 className="text-sm font-medium text-ink-1">{title}</h2>
        {meta && <p className="text-xs text-ink-3">{meta}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </header>
  );
}

/* ── Pill / chip ────────────────────────────────────────────────────── */

type PillTone = "neutral" | "accent" | "success" | "warn" | "danger";

const PILL_TONES: Record<PillTone, string> = {
  neutral: "bg-muted text-ink-2",
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
};

export function Pill({
  tone = "neutral",
  className,
  children,
}: {
  tone?: PillTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        PILL_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ── EmptyState ─────────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 rounded-full bg-muted p-3 text-ink-3">{icon}</div>
      )}
      <h2 className="font-serif text-xl font-semibold text-ink-1">{title}</h2>
      {body && <p className="mt-2 text-sm text-ink-3">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
