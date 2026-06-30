import { db } from "@/db";
import { switches } from "@/db/schema";
import { applyCheckin } from "@/lib/checkin";
import { getSession } from "@/lib/session";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const [sw] = await db
    .select()
    .from(switches)
    .where(and(eq(switches.id, id), eq(switches.userId, session.userId)));

  if (!sw) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (sw.status !== "active") {
    return NextResponse.json({ error: "Switch is not active" }, { status: 409 });
  }

  const newDeadline = await applyCheckin(sw.id, sw.intervalDays, "dashboard");

  return NextResponse.json({ ok: true, deadline: newDeadline.toISOString() });
}
