import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();
  const isSignedIn = Boolean(session);

  return (
    <main className="grain relative min-h-screen overflow-hidden">
      {/* Ambient warm glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[60rem] w-[60rem] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, oklch(78% 0.14 62 / 0.10), transparent 70%)",
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 pt-10">
        <Link href="/" className="inline-flex items-baseline gap-2">
          <span className="font-serif text-xl italic text-ink">Dead Man&apos;s</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
            switch
          </span>
        </Link>
        <Link
          href={isSignedIn ? "/dashboard" : "/sign-in"}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/40 backdrop-blur px-5 py-2 text-sm font-medium text-ink hover:border-line-strong hover:bg-surface transition-colors"
        >
          {isSignedIn ? "Open dashboard" : "Sign in"}
          <span aria-hidden className="text-ink-mute">→</span>
        </Link>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[78vh] w-full max-w-3xl flex-col justify-center px-6 pb-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ember">
          A small, careful place
        </p>
        <h1 className="mt-6 font-serif text-[clamp(3rem,9vw,7rem)] leading-[0.95] tracking-tight text-ink">
          If you go quiet,
          <br />
          <span className="italic text-ink-soft">it sends.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-ink-soft leading-relaxed">
          Write a message. Pick a deadline. Check in to reset the clock. If you
          ever stop checking in, we deliver it on your behalf —{" "}
          <span className="text-ink">once, encrypted until it leaves.</span>
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href={isSignedIn ? "/dashboard/new" : "/sign-in"}
            className="inline-flex items-center gap-2 rounded-full bg-ember text-canvas px-6 py-3 text-sm font-medium hover:bg-ember-deep transition-colors"
          >
            {isSignedIn ? "Write a switch" : "Get started"} →
          </Link>
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-in"}
            className="text-sm text-ink-soft hover:text-ink transition-colors"
          >
            {isSignedIn ? "See yours" : "I already have one"}
          </Link>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-24">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
          <UseCase
            kicker="01"
            title="A letter to future-you."
            body="Drop a note to the version of yourself reading it in a year. Or five."
          />
          <UseCase
            kicker="02"
            title="The server password."
            body="“If I ghost for 30 days, tell my team it's stored at…” — sent only if needed."
          />
          <UseCase
            kicker="03"
            title="The goodbye you'd never write."
            body="Words for the people who matter, ready in case the worst happens."
          />
        </div>

        <div className="mt-16 flex flex-wrap items-start justify-between gap-8 border-t border-line pt-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
              How it works
            </p>
            <ol className="mt-4 space-y-3 text-ink-soft">
              <Step n={1}>Write a message, pick a recipient, pick an interval.</Step>
              <Step n={2}>We email you reminders 7 days and 1 day before deadline.</Step>
              <Step n={3}>One click resets the clock. No login needed for that.</Step>
              <Step n={4}>If silence wins, we decrypt once and send it. Then forget it.</Step>
            </ol>
          </div>
          <Link
            href={isSignedIn ? "/dashboard/new" : "/sign-in"}
            className="self-end inline-flex items-center gap-2 rounded-full border border-line-strong text-ink px-5 py-2.5 text-sm hover:bg-surface transition-colors"
          >
            Start a switch →
          </Link>
        </div>
      </section>

      <footer className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-10">
        <div className="border-t border-line pt-6 flex items-center justify-between text-xs text-ink-mute">
          <span className="font-mono">Built quietly. Encrypted in transit and at rest.</span>
          <span className="font-mono">&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}

function UseCase({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-canvas p-8 hover:bg-surface transition-colors">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">
        {kicker}
      </div>
      <h3 className="mt-4 font-serif text-2xl leading-tight text-ink">{title}</h3>
      <p className="mt-3 text-sm text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="font-mono text-xs text-ink-mute pt-1 w-5 tabular-nums">
        {n.toString().padStart(2, "0")}
      </span>
      <span className="flex-1">{children}</span>
    </li>
  );
}
