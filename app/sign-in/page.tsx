"use client";

import { primaryButtonLarge } from "@/components/ui/buttonStyles";
import { ArrowRightIcon } from "@/components/ui/icons";
import Link from "next/link";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const res = await fetch("/api/auth/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setStatus(res.ok ? "sent" : "error");
  }

  return (
    <main className="grain relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[40rem] w-[40rem] rounded-full"
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
      </header>

      <section className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-6 pb-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ember">
          Sign in
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-none text-ink">
          Welcome back.
        </h1>
        <p className="mt-4 text-ink-soft">
          We&apos;ll email you a sign-in link. No passwords to remember.
        </p>

        {status === "sent" ? (
          <div className="mt-12 rounded-xl border border-ok/30 bg-ok/5 px-6 py-6">
            <p className="font-serif text-xl text-ink">Check your inbox.</p>
            <p className="mt-2 text-sm text-ink-soft">
              We sent a sign-in link to{" "}
              <span className="font-mono text-ink">{email}</span>. It expires in
              15 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-12 space-y-6">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                className="mt-2 w-full bg-transparent border-0 border-b border-line focus:border-ember outline-none py-2 text-xl font-mono text-ink placeholder:text-ink-mute/60 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className={`${primaryButtonLarge} w-full`}
            >
              <span>{status === "sending" ? "Sending…" : "Send me a link"}</span>
              {status !== "sending" && (
                <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
            {status === "error" && (
              <p className="text-sm text-danger" role="alert">
                Something went wrong. Try again.
              </p>
            )}
          </form>
        )}
      </section>
    </main>
  );
}
