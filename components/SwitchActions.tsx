"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  switchId: string;
};

export function SwitchActions({ switchId }: Props) {
  const router = useRouter();
  const [checkingIn, setCheckingIn] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckin() {
    setError(null);
    setCheckingIn(true);
    const res = await fetch(`/api/switches/${switchId}/checkin`, { method: "POST" });
    setCheckingIn(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Couldn't check in.");
      return;
    }
    router.refresh();
  }

  async function handleCancel() {
    setError(null);
    setCancelling(true);
    const res = await fetch(`/api/switches/${switchId}`, { method: "DELETE" });
    setCancelling(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Couldn't cancel.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {confirming ? (
          <>
            <span className="text-xs text-ink-mute">Cancel for real?</span>
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="rounded-md border border-danger/40 text-danger hover:bg-danger/10 px-2.5 py-1 text-xs font-medium disabled:opacity-50"
            >
              {cancelling ? "Cancelling…" : "Yes, cancel"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-xs text-ink-mute hover:text-ink-soft px-2 py-1"
            >
              Keep
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-xs text-ink-mute hover:text-ink-soft px-2 py-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCheckin}
              disabled={checkingIn}
              className="rounded-md bg-ink text-canvas px-3.5 py-1.5 text-sm font-medium hover:bg-ink-soft disabled:opacity-50 transition-colors"
            >
              {checkingIn ? "Checking in…" : "Check in"}
            </button>
          </>
        )}
      </div>
      {error && (
        <span className="text-xs text-danger" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
