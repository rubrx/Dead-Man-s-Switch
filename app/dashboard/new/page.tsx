"use client";

import { primaryButtonLarge } from "@/components/ui/buttonStyles";
import { ArrowRightIcon } from "@/components/ui/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const INTERVAL_PRESETS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "1 year", value: 365 },
];

export default function NewSwitchPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [intervalDays, setIntervalDays] = useState(30);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    const res = await fetch("/api/switches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, recipientEmail, message, intervalDays }),
    });

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setErrorMsg(data?.error ?? "Something went wrong. Try again.");
    setStatus("error");
  }

  const isSaving = status === "saving";

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 pt-10 pb-6">
        <Link href="/dashboard" className="text-xs text-ink-mute hover:text-ink-soft transition-colors">
          ← Dashboard
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
          New switch
        </span>
      </header>

      <section className="mx-auto w-full max-w-2xl px-6 pb-24">
        <h1 className="font-serif text-4xl sm:text-5xl text-ink leading-none">
          Write the message.
        </h1>
        <p className="mt-4 text-ink-soft max-w-md">
          We&apos;ll hold onto it, encrypted, and only send if you don&apos;t check in by
          the deadline. You can cancel any time.
        </p>

        <form onSubmit={handleSubmit} className="mt-12 space-y-10">
          <Field
            label="Title"
            hint="A short name only you see — so you can tell switches apart."
          >
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Letter to my brother"
              className="w-full bg-transparent border-0 border-b border-line focus:border-ember outline-none py-2 text-2xl font-serif text-ink placeholder:text-ink-mute/60 transition-colors"
            />
          </Field>

          <Field
            label="Recipient"
            hint="Where the message goes if the switch fires."
          >
            <input
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="them@example.com"
              className="w-full bg-transparent border-0 border-b border-line focus:border-ember outline-none py-2 text-lg font-mono text-ink placeholder:text-ink-mute/60 transition-colors"
            />
          </Field>

          <Field
            label="Message"
            hint="The content delivered to them. Encrypted before it touches the database."
          >
            <textarea
              required
              maxLength={10_000}
              rows={10}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="If you're reading this…"
              className="w-full bg-surface border border-line rounded-lg focus:border-ember outline-none p-4 text-ink placeholder:text-ink-mute/60 transition-colors resize-y leading-relaxed"
            />
            <div className="mt-1 text-right text-[10px] font-mono text-ink-mute tabular-nums">
              {message.length.toLocaleString()} / 10,000
            </div>
          </Field>

          <Field
            label="Check in every"
            hint="If this much time passes without a check-in, the message sends."
          >
            <div className="flex flex-wrap gap-2">
              {INTERVAL_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setIntervalDays(preset.value)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    intervalDays === preset.value
                      ? "border-ember text-ember bg-ember/5"
                      : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <div className="flex items-center gap-2 ml-1">
                <input
                  type="number"
                  required
                  min={1}
                  max={365}
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(Number(e.target.value))}
                  className="w-20 bg-transparent border border-line rounded-full focus:border-ember outline-none px-3 py-1.5 text-sm font-mono text-ink text-center tabular-nums transition-colors"
                />
                <span className="text-sm text-ink-mute">days</span>
              </div>
            </div>
          </Field>

          {errorMsg && (
            <p className="text-sm text-danger" role="alert">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-line">
            <p className="text-xs text-ink-mute max-w-xs">
              You&apos;ll get a reminder one week and one day before the deadline.
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className={primaryButtonLarge}
            >
              <span>{isSaving ? "Arming…" : "Arm the switch"}</span>
              {!isSaving && (
                <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
          {label}
        </div>
        {hint && <div className="mt-1 text-xs text-ink-mute">{hint}</div>}
      </div>
      {children}
    </div>
  );
}
