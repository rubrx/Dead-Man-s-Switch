import { db } from "@/db";
import { magicLinks, users } from "@/db/schema";
import { createSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/sign-in?error=missing_token`);
  }

  const [link] = await db
    .select()
    .from(magicLinks)
    .where(eq(magicLinks.token, token));

  if (!link) {
    return NextResponse.redirect(`${baseUrl}/sign-in?error=invalid_token`);
  }

  if (link.expiresAt < new Date()) {
    await db.delete(magicLinks).where(eq(magicLinks.id, link.id));
    return NextResponse.redirect(`${baseUrl}/sign-in?error=expired_token`);
  }

  // Token is valid and unexpired — consume it immediately (one-time use)
  await db.delete(magicLinks).where(eq(magicLinks.id, link.id));

  // Find or create the user
  let [user] = await db.select().from(users).where(eq(users.email, link.email));
  if (!user) {
    [user] = await db.insert(users).values({ email: link.email }).returning();
  }

  await createSession(user.id);

  return NextResponse.redirect(`${baseUrl}/dashboard`);
}