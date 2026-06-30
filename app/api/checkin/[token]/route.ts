import { db } from "@/db";
import { switches } from "@/db/schema";
import { applyCheckin } from "@/lib/checkin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await ctx.params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/checked-in?status=invalid`);
  }

  const [sw] = await db
    .select()
    .from(switches)
    .where(eq(switches.checkinToken, token));

  if (!sw) {
    return NextResponse.redirect(`${baseUrl}/checked-in?status=invalid`);
  }
  if (sw.status !== "active") {
    return NextResponse.redirect(`${baseUrl}/checked-in?status=inactive`);
  }

  const newDeadline = await applyCheckin(sw.id, sw.intervalDays, "email_link");
  const when = encodeURIComponent(newDeadline.toISOString());
  const title = encodeURIComponent(sw.title);

  return NextResponse.redirect(
    `${baseUrl}/checked-in?status=ok&title=${title}&deadline=${when}`,
  );
}
