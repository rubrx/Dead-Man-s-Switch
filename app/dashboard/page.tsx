import { SignOutButton } from "@/components/SignOutButton";
import { SwitchCard } from "@/components/SwitchCard";
import { primaryButton } from "@/components/ui/buttonStyles";
import { PlusIcon } from "@/components/ui/icons";
import { db } from "@/db";
import { checkinLog, switches, users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, session.userId));

  const rows = await db
    .select({
      id: switches.id,
      title: switches.title,
      recipientEmail: switches.recipientEmail,
      intervalDays: switches.intervalDays,
      deadline: switches.deadline,
      status: switches.status,
      createdAt: switches.createdAt,
      sentAt: switches.sentAt,
      lastCheckedInAt: sql<Date | null>`MAX(${checkinLog.checkedInAt})`.as(
        "last_checked_in_at",
      ),
    })
    .from(switches)
    .leftJoin(checkinLog, eq(checkinLog.switchId, switches.id))
    .where(eq(switches.userId, session.userId))
    .groupBy(switches.id)
    .orderBy(desc(switches.status), desc(switches.createdAt));

  const active = rows.filter((r) => r.status === "active");
  const archived = rows.filter((r) => r.status !== "active");

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 pt-10 pb-6">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="font-serif text-xl italic text-ink leading-none">
            Dead Man&apos;s
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute group-hover:text-ink-soft transition-colors">
            switch
          </span>
        </Link>
        <IdentityCluster email={user?.email} />
      </header>

      <section className="mx-auto w-full max-w-3xl px-6 pb-24">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl text-ink leading-none">
              Your switches
            </h1>
            <p className="mt-3 text-sm text-ink-soft max-w-md">
              {active.length === 0
                ? "Nothing armed right now. Make one — a note, a password, a goodbye."
                : `${active.length} armed. Check in before the deadline to keep them quiet.`}
            </p>
          </div>
          <Link href="/dashboard/new" className={`${primaryButton} shrink-0`}>
            <PlusIcon className="h-3.5 w-3.5" />
            <span>New switch</span>
          </Link>
        </div>

        {rows.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 space-y-4">
            {active.map((sw) => (
              <SwitchCard key={sw.id} sw={sw} />
            ))}

            {archived.length > 0 && (
              <>
                <div className="pt-8 pb-2 flex items-center gap-3">
                  <div className="h-px flex-1 bg-line" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
                    Archive
                  </span>
                  <div className="h-px flex-1 bg-line" />
                </div>
                {archived.map((sw) => (
                  <SwitchCard key={sw.id} sw={sw} />
                ))}
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function IdentityCluster({ email }: { email: string | undefined }) {
  return (
    <div className="flex items-center gap-3">
      {email && (
        <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-line bg-surface/40 backdrop-blur pl-1.5 pr-3 py-1">
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-ember/20 text-[10px] font-mono uppercase text-ember"
            aria-hidden
          >
            {email.charAt(0)}
          </span>
          <span className="font-mono text-[11px] text-ink-soft">{email}</span>
        </div>
      )}
      <SignOutButton />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 rounded-2xl border border-dashed border-line bg-surface/40 px-8 py-16 text-center">
      <p className="font-serif text-2xl text-ink-soft italic">
        &ldquo;If you don&apos;t hear from me by…&rdquo;
      </p>
      <p className="mt-4 text-sm text-ink-mute max-w-sm mx-auto">
        Write the message now. Pick when it should send if you go quiet. You can
        always check in to reset the clock.
      </p>
      <Link href="/dashboard/new" className={`${primaryButton} mt-8`}>
        <PlusIcon className="h-3.5 w-3.5" />
        <span>Write your first switch</span>
      </Link>
    </div>
  );
}
