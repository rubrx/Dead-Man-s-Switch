import Link from "next/link";

type Search = {
  status?: string;
  title?: string;
  deadline?: string;
};

export default async function CheckedInPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { status, title, deadline } = await searchParams;

  if (status === "ok") {
    const when = deadline
      ? new Date(deadline).toLocaleString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : null;

    return (
      <Frame kicker="Checked in" tone="ok">
        <h1 className="font-serif text-5xl leading-none text-ink">
          You&apos;re still here.
        </h1>
        <p className="mt-4 text-ink-soft">
          We reset the clock on{" "}
          <span className="font-serif italic text-ink">
            &ldquo;{title ?? "your switch"}&rdquo;
          </span>
          .
        </p>
        {when && (
          <p className="mt-1 text-sm text-ink-mute">
            Next deadline:{" "}
            <span className="font-mono text-ink-soft">{when}</span>
          </p>
        )}
        <div className="mt-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-ember text-canvas px-5 py-2.5 text-sm font-medium hover:bg-ember-deep transition-colors"
          >
            See your dashboard →
          </Link>
        </div>
      </Frame>
    );
  }

  if (status === "inactive") {
    return (
      <Frame kicker="Already settled" tone="mute">
        <h1 className="font-serif text-4xl text-ink">This switch is closed.</h1>
        <p className="mt-4 text-ink-soft">
          It&apos;s already been sent or cancelled, so there&apos;s nothing left
          to check in on.
        </p>
        <div className="mt-10">
          <Link href="/dashboard" className="text-sm text-ink-soft hover:text-ink">
            Back to dashboard →
          </Link>
        </div>
      </Frame>
    );
  }

  return (
    <Frame kicker="Invalid link" tone="danger">
      <h1 className="font-serif text-4xl text-ink">That link didn&apos;t work.</h1>
      <p className="mt-4 text-ink-soft">
        It may have been used already, or the switch may no longer exist. If you
        meant to check in, sign in and do it from your dashboard.
      </p>
      <div className="mt-10">
        <Link href="/sign-in" className="text-sm text-ink-soft hover:text-ink">
          Sign in →
        </Link>
      </div>
    </Frame>
  );
}

function Frame({
  kicker,
  tone,
  children,
}: {
  kicker: string;
  tone: "ok" | "mute" | "danger";
  children: React.ReactNode;
}) {
  const accent =
    tone === "ok" ? "text-ok" : tone === "danger" ? "text-danger" : "text-ink-mute";
  return (
    <main className="grain relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[40rem] w-[40rem] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, oklch(74% 0.12 158 / 0.10), transparent 70%)",
        }}
      />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6">
        <p className={`font-mono text-[11px] uppercase tracking-[0.22em] ${accent}`}>
          {kicker}
        </p>
        <div className="mt-4">{children}</div>
      </section>
    </main>
  );
}
