import { db } from "@/db";
import { checkinLog, reminderLog, switches } from "@/db/schema";
import { eq } from "drizzle-orm";

const ONE_DAY_MS = 86_400_000;

export type CheckinMethod = "dashboard" | "email_link";

export async function applyCheckin(
  switchId: string,
  intervalDays: number,
  method: CheckinMethod,
): Promise<Date> {
  const newDeadline = new Date(Date.now() + intervalDays * ONE_DAY_MS);

  await db.update(switches).set({ deadline: newDeadline }).where(eq(switches.id, switchId));
  await db.insert(checkinLog).values({ switchId, method });
  // Clear reminder log so future reminders fire again in the next deadline cycle.
  await db.delete(reminderLog).where(eq(reminderLog.switchId, switchId));

  return newDeadline;
}
