import { db } from "@/db";
import { magicLinks } from "@/db/schema";
import { sendMagicLinkEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await db.insert(magicLinks).values({
    email: normalizedEmail,
    token,
    expiresAt,
  });

  const link = `${req.nextUrl.origin}/api/auth/verify?token=${token}`;

  await sendMagicLinkEmail(normalizedEmail, link);

  return NextResponse.json({ ok: true });
}