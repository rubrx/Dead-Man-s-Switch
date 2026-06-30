import { db } from "@/db";
import { reminderLog, switches, users } from "@/db/schema";
import { decrypt } from "@/lib/crypto";
import { sendDeliveryEmail, sendReminderEmail } from "@/lib/email";
import { and, eq, lte } from "drizzle-orm";

const ONE_DAY_MS = 86_400_000;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

export type DispatchSummary = {
  delivered: number;
  reminded7d: number;
  reminded1d: number;
  errors: string[];
};

export async function runDispatch(baseUrl: string): Promise<DispatchSummary> {
  const summary: DispatchSummary = {
    delivered: 0,
    reminded7d: 0,
    reminded1d: 0,
    errors: [],
  };
  const now = new Date();

  const active = await db
    .select({
      sw: switches,
      ownerEmail: users.email,
    })
    .from(switches)
    .innerJoin(users, eq(users.id, switches.userId))
    .where(eq(switches.status, "active"));

  for (const row of active) {
    const sw = row.sw;
    const msRemaining = sw.deadline.getTime() - now.getTime();

    try {
      if (msRemaining <= 0) {
        await deliverAndClose({
          switchId: sw.id,
          encryptedMessage: sw.encryptedMessage,
          recipientEmail: sw.recipientEmail,
          senderEmail: row.ownerEmail,
          switchTitle: sw.title,
        });
        summary.delivered += 1;
        continue;
      }

      const sent = await getSentReminderTypes(sw.id);

      if (msRemaining <= ONE_DAY_MS && !sent.has("1_day")) {
        await sendReminderEmail({
          to: row.ownerEmail,
          switchTitle: sw.title,
          recipientEmail: sw.recipientEmail,
          deadline: sw.deadline,
          checkinLink: `${baseUrl}/api/checkin/${sw.checkinToken}`,
          type: "1_day",
        });
        await db.insert(reminderLog).values({ switchId: sw.id, type: "1_day" });
        summary.reminded1d += 1;
        continue;
      }

      if (msRemaining <= SEVEN_DAYS_MS && !sent.has("7_day")) {
        await sendReminderEmail({
          to: row.ownerEmail,
          switchTitle: sw.title,
          recipientEmail: sw.recipientEmail,
          deadline: sw.deadline,
          checkinLink: `${baseUrl}/api/checkin/${sw.checkinToken}`,
          type: "7_day",
        });
        await db.insert(reminderLog).values({ switchId: sw.id, type: "7_day" });
        summary.reminded7d += 1;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "unknown";
      summary.errors.push(`switch ${sw.id}: ${message}`);
    }
  }

  return summary;
}

async function getSentReminderTypes(switchId: string): Promise<Set<string>> {
  const rows = await db
    .select({ type: reminderLog.type })
    .from(reminderLog)
    .where(eq(reminderLog.switchId, switchId));
  return new Set(rows.map((r) => r.type));
}

type DeliverInput = {
  switchId: string;
  encryptedMessage: string;
  recipientEmail: string;
  senderEmail: string;
  switchTitle: string;
};

async function deliverAndClose(input: DeliverInput): Promise<void> {
  const plaintext = decrypt(input.encryptedMessage);

  await sendDeliveryEmail({
    to: input.recipientEmail,
    senderEmail: input.senderEmail,
    switchTitle: input.switchTitle,
    message: plaintext,
  });

  // Mark sent and scrub the encrypted message from the row — we promised the
  // recipient that the body isn't stored after delivery.
  await db
    .update(switches)
    .set({ status: "sent", sentAt: new Date(), encryptedMessage: "" })
    .where(and(eq(switches.id, input.switchId), eq(switches.status, "active")));

  await db.insert(reminderLog).values({ switchId: input.switchId, type: "final" });
}

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function findOverdueCount(): Promise<number> {
  const rows = await db
    .select({ id: switches.id })
    .from(switches)
    .where(and(eq(switches.status, "active"), lte(switches.deadline, new Date())));
  return rows.length;
}
