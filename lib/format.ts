export type DeadlineTone = "ok" | "warn" | "danger" | "fired";

export type DeadlineDisplay = {
  label: string;
  sublabel: string;
  tone: DeadlineTone;
  msRemaining: number;
};

export function describeDeadline(deadline: Date, now: Date = new Date()): DeadlineDisplay {
  const msRemaining = deadline.getTime() - now.getTime();
  const absoluteWhen = deadline.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  if (msRemaining <= 0) {
    return {
      label: "Deadline passed",
      sublabel: absoluteWhen,
      tone: "fired",
      msRemaining,
    };
  }

  const days = Math.floor(msRemaining / 86_400_000);
  const hours = Math.floor((msRemaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((msRemaining % 3_600_000) / 60_000);
  const seconds = Math.floor((msRemaining % 60_000) / 1000);

  let label: string;
  if (days >= 1) label = `${days}d ${hours.toString().padStart(2, "0")}h`;
  else if (hours >= 1)
    label = `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  else label = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;

  const tone: DeadlineTone = days < 1 ? "danger" : days < 7 ? "warn" : "ok";

  return { label, sublabel: absoluteWhen, tone, msRemaining };
}

export function describeRelative(date: Date, now: Date = new Date()): string {
  const diff = now.getTime() - date.getTime();
  if (diff < 0) return "just now";
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month}mo ago`;
  return `${Math.floor(month / 12)}y ago`;
}
