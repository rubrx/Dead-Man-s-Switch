import { Countdown } from "@/components/Countdown";
import { SwitchActions } from "@/components/SwitchActions";
import { describeRelative } from "@/lib/format";

// Date | string because Drizzle's neon-http returns Date for typed timestamp
// columns but plain strings for raw sql<> aggregates like MAX(checked_in_at).
type SwitchRow = {
  id: string;
  title: string;
  recipientEmail: string;
  intervalDays: number;
  deadline: Date | string;
  status: "active" | "sent" | "cancelled";
  createdAt: Date | string;
  sentAt: Date | string | null;
  lastCheckedInAt: Date | string | null;
};

function toDate(v: Date | string): Date {
  return v instanceof Date ? v : new Date(v);
}

type Props = {
  sw: SwitchRow;
};

export function SwitchCard({ sw }: Props) {
  const isActive = sw.status === "active";
  const lastTouch =
    sw.lastCheckedInAt ?? sw.createdAt;
  const lastTouchLabel = sw.lastCheckedInAt
    ? `Last check-in ${describeRelative(sw.lastCheckedInAt)}`
    : `Created ${describeRelative(sw.createdAt)}`;

  return (
    <article
      className={`relative grain rounded-2xl border border-line bg-surface px-6 py-6 sm:px-8 sm:py-7 transition-colors ${
        !isActive ? "opacity-70" : "hover:border-line-strong"
      }`}
    >
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <StatusPill status={sw.status} />
          <h2 className="mt-3 font-serif text-3xl leading-tight text-ink">
            {sw.title}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            to{" "}
            <span className="font-mono text-ink">{sw.recipientEmail}</span>
            <span className="text-ink-mute"> · </span>
            every{" "}
            <span className="font-mono text-ink">{sw.intervalDays}d</span>
          </p>
        </div>

        {isActive && (
          <div className="shrink-0 text-right">
            <Countdown deadlineISO={toDate(sw.deadline).toISOString()} />
          </div>
        )}
        {sw.status === "sent" && (
          <div className="shrink-0 text-right text-xs text-ink-mute">
            <div>Sent</div>
            <div className="font-mono text-ink-soft mt-1">
              {sw.sentAt ? describeRelative(sw.sentAt) : ""}
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-6 flex items-center justify-between gap-4 border-t border-line pt-4">
        <span className="text-xs text-ink-mute" suppressHydrationWarning>
          {lastTouchLabel}
        </span>
        {isActive && <SwitchActions switchId={sw.id} />}
        {sw.status === "cancelled" && (
          <span className="text-xs uppercase tracking-[0.16em] text-ink-mute">
            Cancelled · {describeRelative(lastTouch)}
          </span>
        )}
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: "active" | "sent" | "cancelled" }) {
  const config = {
    active: {
      label: "Armed",
      dot: "bg-ember",
      text: "text-ember",
      ring: "ring-ember/30",
    },
    sent: {
      label: "Delivered",
      dot: "bg-ok",
      text: "text-ok",
      ring: "ring-ok/30",
    },
    cancelled: {
      label: "Cancelled",
      dot: "bg-ink-mute",
      text: "text-ink-mute",
      ring: "ring-ink-mute/20",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ring-1 ${config.text} ${config.ring}`}
    >
      <span
        className={`relative inline-flex h-1.5 w-1.5 rounded-full ${config.dot}`}
      >
        {status === "active" && (
          <span
            className={`absolute inset-0 animate-ping rounded-full ${config.dot} opacity-60`}
          />
        )}
      </span>
      {config.label}
    </span>
  );
}
