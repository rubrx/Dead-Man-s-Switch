"use client";

import { describeDeadline, type DeadlineTone } from "@/lib/format";
import { useEffect, useState } from "react";

type Props = {
  deadlineISO: string;
};

const TONE_CLASSES: Record<DeadlineTone, string> = {
  ok: "text-ink",
  warn: "text-warn",
  danger: "text-ember",
  fired: "text-danger",
};

export function Countdown({ deadlineISO }: Props) {
  const deadline = new Date(deadlineISO);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const { label, sublabel, tone } = describeDeadline(deadline);

  return (
    <div className="leading-none">
      <div
        className={`font-mono text-3xl tabular-nums tracking-tight ${TONE_CLASSES[tone]}`}
        suppressHydrationWarning
      >
        {label}
      </div>
      <div className="mt-2 text-xs text-ink-mute" suppressHydrationWarning>
        until {sublabel}
      </div>
    </div>
  );
}
