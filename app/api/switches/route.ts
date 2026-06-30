import { db } from "@/db";
import { switches } from "@/db/schema";
import { encrypt } from "@/lib/crypto";
import { getSession } from "@/lib/session";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const MAX_TITLE_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 10_000;
const MIN_INTERVAL_DAYS = 1;
const MAX_INTERVAL_DAYS = 365;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { title, recipientEmail, message, intervalDays } = body as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length === 0 || title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: "Title required (max 200 chars)" }, { status: 400 });
  }
  if (typeof recipientEmail !== "string" || !recipientEmail.includes("@")) {
    return NextResponse.json({ error: "Valid recipient email required" }, { status: 400 });
  }
  if (typeof message !== "string" || message.trim().length === 0 || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message required (max 10,000 chars)" }, { status: 400 });
  }
  if (
    typeof intervalDays !== "number" ||
    !Number.isInteger(intervalDays) ||
    intervalDays < MIN_INTERVAL_DAYS ||
    intervalDays > MAX_INTERVAL_DAYS
  ) {
    return NextResponse.json(
      { error: `Interval must be ${MIN_INTERVAL_DAYS}-${MAX_INTERVAL_DAYS} days` },
      { status: 400 },
    );
  }

  const encryptedMessage = encrypt(message);
  const checkinToken = randomBytes(32).toString("hex");
  const deadline = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);

  const [created] = await db
    .insert(switches)
    .values({
      userId: session.userId,
      title: title.trim(),
      recipientEmail: recipientEmail.trim().toLowerCase(),
      encryptedMessage,
      intervalDays,
      deadline,
      checkinToken,
    })
    .returning({ id: switches.id });

  return NextResponse.json({ ok: true, id: created.id });
}
