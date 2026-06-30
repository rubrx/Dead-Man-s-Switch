// Shared button class strings. Centralizing here so every CTA across the
// app uses the same surface treatment, padding, and motion language.

export const primaryButton =
  "group inline-flex items-center justify-center gap-2 rounded-full bg-ember text-canvas px-5 py-2.5 text-sm font-medium " +
  "shadow-[inset_0_1px_0_oklch(100%_0_0_/_0.28),0_1px_2px_oklch(0%_0_0_/_0.45)] " +
  "hover:bg-ember-deep hover:shadow-[inset_0_1px_0_oklch(100%_0_0_/_0.28),0_0_0_4px_oklch(78%_0.14_62/_0.18),0_1px_2px_oklch(0%_0_0_/_0.45)] " +
  "active:translate-y-px " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[inset_0_1px_0_oklch(100%_0_0_/_0.28),0_1px_2px_oklch(0%_0_0_/_0.45)] " +
  "transition-all duration-150";

export const primaryButtonLarge =
  "group inline-flex items-center justify-center gap-2 rounded-full bg-ember text-canvas px-6 py-3 text-sm font-medium " +
  "shadow-[inset_0_1px_0_oklch(100%_0_0_/_0.28),0_1px_2px_oklch(0%_0_0_/_0.45)] " +
  "hover:bg-ember-deep hover:shadow-[inset_0_1px_0_oklch(100%_0_0_/_0.28),0_0_0_5px_oklch(78%_0.14_62/_0.2),0_1px_2px_oklch(0%_0_0_/_0.45)] " +
  "active:translate-y-px " +
  "disabled:opacity-50 " +
  "transition-all duration-150";

export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface/40 backdrop-blur px-4 py-2 text-sm font-medium text-ink " +
  "hover:border-line-strong hover:bg-surface " +
  "disabled:opacity-50 " +
  "transition-colors duration-150";

export const secondaryButtonSmall =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-surface/40 backdrop-blur px-3 py-1.5 text-xs font-medium text-ink-soft " +
  "hover:border-line-strong hover:bg-surface hover:text-ink " +
  "disabled:opacity-50 " +
  "transition-colors duration-150";

export const ghostButton =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-ink-mute " +
  "hover:bg-surface hover:text-ink-soft " +
  "disabled:opacity-50 " +
  "transition-colors duration-150";

export const dangerGhostButton =
  "inline-flex items-center gap-1.5 rounded-full border border-danger/40 text-danger px-3 py-1.5 text-xs font-medium " +
  "hover:bg-danger/10 " +
  "disabled:opacity-50 " +
  "transition-colors duration-150";
