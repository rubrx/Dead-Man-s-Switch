"use client";

import { primaryButton, secondaryButton } from "@/components/ui/buttonStyles";
import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: Props) {
  return (
    <main className="grain relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[40rem] w-[40rem] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, oklch(70% 0.2 22 / 0.12), transparent 70%)",
        }}
      />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-danger">
          Something broke
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-none text-ink">
          The dashboard couldn&apos;t load.
        </h1>
        <p className="mt-4 text-ink-soft">
          Your switches are safe. We just couldn&apos;t render this page.
        </p>

        {error.digest && (
          <div className="mt-6 rounded-lg border border-line bg-surface px-4 py-3 font-mono text-xs text-ink-mute">
            digest: <span className="text-ink-soft">{error.digest}</span>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => reset()} className={primaryButton}>
            Try again
          </button>
          <Link href="/" className={secondaryButton}>
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
